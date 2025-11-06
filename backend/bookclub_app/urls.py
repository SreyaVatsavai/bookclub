# bookclub_app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.user_login, name='login'),
    path('auth/logout/', views.user_logout, name='logout'),
    path('auth/user/', views.get_user, name='get_user'),

    # Books
    path('books/', views.book_list, name='book-list'),
    path('books/<int:pk>/', views.book_detail, name='book-detail'),

    # Groups
    path('groups/', views.group_list_create, name='group-list-create'),
    path('groups/<int:pk>/join/', views.join_group, name='join-group'),
    # Add to app urls.py
    path('groups/<int:group_id>/discussion/', views.group_discussion, name='group-discussion'),
]