# bookclub_app/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Book, DiscussionPost, ReadingGroup, Comment
from .models import GroupMembership

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'description', 'total_pages', 'total_chapters', 'cover']

class ReadingGroupSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    creator_name = serializers.CharField(source='creator.username', read_only=True)

    class Meta:
        model = ReadingGroup
        fields = [
            'id', 'name', 'book', 'book_title', 'creator', 'creator_name',
            'start_date', 'end_date', 'member_count', 'is_full'
        ]
        read_only_fields = ['creator']

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return data
    

class GroupMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'username', 'joined_at']
        read_only_fields = ['user', 'username', 'joined_at']


class ReadingGroupDetailSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    members = GroupMemberSerializer(source='memberships', many=True, read_only=True)
    book_info = serializers.SerializerMethodField()

    class Meta:
        model = ReadingGroup
        fields = ['id', 'name', 'book', 'book_title', 'book_info', 'creator', 'creator_name', 'start_date', 'end_date', 'members']

    def get_book_info(self, obj):
        # Provide basic book info; cover_url if available on Book model
        book = obj.book
        data = {
            'id': book.id,
            'title': book.title,
            'author': book.author,
        }
        # include cover URL if image uploaded
        if getattr(book, 'cover'):
            try:
                data['cover_url'] = book.cover.url
            except Exception:
                data['cover_url'] = None
        else:
            data['cover_url'] = None
        return data
    


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_name', 'content', 'created_at']
        read_only_fields = ['author', 'post']

class DiscussionPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)

    class Meta:
        model = DiscussionPost
        fields = [
            'id', 'group', 'author', 'author_name', 'chapter', 'chapter_title',
            'content', 'created_at', 'comments'
        ]
        read_only_fields = ['author', 'group']
        # Make chapter optional
        extra_kwargs = {
            'chapter': {'required': False, 'allow_null': True}
        }