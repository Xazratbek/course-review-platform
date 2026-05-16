from django.contrib import admin
from .models import Review, ReviewVote, ReviewMedia, Comment


class ReviewMediaInline(admin.TabularInline):
    model = ReviewMedia
    extra = 1


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id','user', 'course', 'rating', 'status', 'is_verified_student', 'likes_count', 'dislikes_count', 'created_at']
    list_filter = ['status', 'rating', 'is_verified_student', 'created_at']
    search_fields = ['user__username', 'course__title', 'title', 'body']
    readonly_fields = ['id', 'created_at', 'updated_at', 'likes_count', 'dislikes_count']
    inlines = [ReviewMediaInline]
    fieldsets = (
        ('Review Info', {
            'fields': ('user', 'course', 'rating', 'title')
        }),
        ('Content', {
            'fields': ('advantages', 'disadvantages', 'body')
        }),
        ('Engagement', {
            'fields': ('likes_count', 'dislikes_count'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('status', 'is_verified_student')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


@admin.register(ReviewVote)
class ReviewVoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'review', 'vote_type', 'created_at']
    list_filter = ['vote_type', 'created_at']
    search_fields = ['user__username', 'review__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ReviewMedia)
class ReviewMediaAdmin(admin.ModelAdmin):
    list_display = ['review', 'image', 'created_at']
    list_filter = ['created_at']
    search_fields = ['review__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id','user', 'review','body', 'parent', 'reply_to','created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'review__title', 'body']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Comment Info', {
            'fields': ('user', 'review', 'parent','reply_to')
        }),
        ('Content', {
            'fields': ('body',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
