from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils.dateparse import parse_date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Book, DiscussionPost, ReadingGroup, GroupMembership, Comment
from .serializers import (
    DiscussionPostSerializer,
    UserSerializer,
    BookSerializer,
    ReadingGroupSerializer,
    CommentSerializer,
)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def group_detail(request, pk):
    """Return group details including members and basic book info.
    Only group members can view the detail.
    """
    try:
        group = get_object_or_404(ReadingGroup, id=pk)
    except ReadingGroup.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    # Only allow members to view group details
    if not GroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({"error": "Not a member of this group"}, status=status.HTTP_403_FORBIDDEN)

    from .serializers import ReadingGroupDetailSerializer

    return Response(ReadingGroupDetailSerializer(group).data)

# ==== AUTH ====

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user."""
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already taken"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(username=username, password=password)
    return Response(
        {"message": "User created. Please log in."}, status=status.HTTP_201_CREATED
    )


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def user_login(request):
    """User login endpoint."""
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)

    if user:
        login(request, user)
        return Response(UserSerializer(user).data)

    return Response(
        {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """Logout current user."""
    logout(request)
    return Response({"message": "Logged out"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request):
    """Fetch current logged-in user details."""
    return Response(UserSerializer(request.user).data)


# ==== BOOKS ====

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def book_list(request):
    """List or search for books."""
    query = request.GET.get("search", "")
    genre = request.GET.get("genre", "")
    books = Book.objects.all()

    if query:
        books = books.filter(Q(title__icontains=query) | Q(author__icontains=query))
    if genre:
        books = books.filter(genre__iexact=genre)

    return Response(BookSerializer(books, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def book_detail(request, pk):
    """Get book details and available groups."""
    try:
        book = Book.objects.prefetch_related("readinggroup_set").get(pk=pk)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    available_groups = book.readinggroup_set.filter(memberships__isnull=False).distinct()
    available_groups = [g for g in available_groups if not g.is_full]

    data = BookSerializer(book).data
    data["available_groups"] = ReadingGroupSerializer(available_groups, many=True).data
    return Response(data)


# ==== GROUPS ====

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def group_list_create(request):
    """List or create reading groups."""
    if request.method == "POST":
        serializer = ReadingGroupSerializer(data=request.data)
        if serializer.is_valid():
            # Create the group and automatically add creator as a member
            group = serializer.save(creator=request.user)
            GroupMembership.objects.create(user=request.user, group=group)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET: list user's groups
    user_groups = ReadingGroup.objects.filter(memberships__user=request.user)
    return Response(ReadingGroupSerializer(user_groups, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_group(request, pk):
    """Join a reading group."""
    try:
        group = ReadingGroup.objects.get(pk=pk)
    except ReadingGroup.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    if group.is_full:
        return Response({"error": "Group is full"}, status=status.HTTP_400_BAD_REQUEST)

    if GroupMembership.objects.filter(user=request.user, group=group).exists():
        return Response({"error": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)

    GroupMembership.objects.create(user=request.user, group=group)
    return Response({"message": "Joined group successfully"})


# ==== DISCUSSIONS ====

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def group_discussion(request, group_id):
    """
    List or create discussion posts in a group.
    Automatically attaches group and user to new posts.
    """
    try:
        group = get_object_or_404(ReadingGroup, id=group_id)
    except ReadingGroup.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if user is a member
    if not GroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response(
            {"error": "Not a member of this group"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "POST":
        # Automatically assign author and group
        serializer = DiscussionPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, group=group)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # GET: list all posts for the group
    posts = DiscussionPost.objects.filter(group=group).prefetch_related("comments")
    return Response(DiscussionPostSerializer(posts, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_comment(request, group_id, post_id):
    """
    Add a comment to a discussion post within a group.
    Ensures the user is a member of the group and the post belongs to the group.
    """
    # Ensure group exists and user is a member
    try:
        group = get_object_or_404(ReadingGroup, id=group_id)
    except ReadingGroup.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    if not GroupMembership.objects.filter(group=group, user=request.user).exists():
        return Response({"error": "Not a member of this group"}, status=status.HTTP_403_FORBIDDEN)

    # Ensure post exists and belongs to the group
    try:
        post = DiscussionPost.objects.get(id=post_id, group=group)
    except DiscussionPost.DoesNotExist:
        return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

    # Create comment
    serializer = CommentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(author=request.user, post=post)

        # Return the updated post (with comments) so clients can refresh the post atomically
        post = DiscussionPost.objects.prefetch_related("comments").get(id=post.id)
        return Response(DiscussionPostSerializer(post).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
