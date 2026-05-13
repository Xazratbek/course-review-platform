from django.contrib import admin
from .models import Report, ModerationAction


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'reporter', 'review', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['reporter__username', 'review__title', 'reason']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Report Info', {
            'fields': ('reporter', 'review', 'reason')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    list_display = ['id', 'moderator', 'review', 'action', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['moderator__username', 'review__title', 'reason']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Action Info', {
            'fields': ('moderator', 'review', 'action')
        }),
        ('Reason', {
            'fields': ('reason',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']
