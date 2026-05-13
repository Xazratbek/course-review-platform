from django.contrib import admin
from .models import CustomUser, UserRole


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_staff', 'created_at']
    list_filter = ['role', 'is_verified', 'is_staff', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Personal Info', {
            'fields': ('username', 'email', 'first_name', 'last_name', 'phone_number', 'avatar', 'bio')
        }),
        ('Role & Permissions', {
            'fields': ('role', 'is_verified', 'is_staff', 'is_superuser', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']