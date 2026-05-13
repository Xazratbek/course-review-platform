from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'receiver', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['receiver__username', 'title', 'body']
    readonly_fields = ['id', 'created_at', 'updated_at', 'metadata']
    fieldsets = (
        ('Notification Info', {
            'fields': ('receiver', 'notification_type', 'title')
        }),
        ('Content', {
            'fields': ('body',)
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
