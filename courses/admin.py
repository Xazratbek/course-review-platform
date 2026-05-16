from django.contrib import admin
from .models import Category, CourseCenter, Mentor, Course, CourseTag, CourseTagItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name', 'slug']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-created_at']


@admin.register(CourseCenter)
class CourseCenterAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'verified', 'created_at']
    list_filter = ['verified', 'created_at']
    search_fields = ['title', 'slug', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'description', 'logo')
        }),
        ('Contact Info', {
            'fields': ('website', 'telegram_url', 'instagram_url')
        }),
        ('Status', {
            'fields': ('verified',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


@admin.register(Mentor)
class MentorAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'slug', 'specialization', 'experience', 'verified', 'created_at']
    list_filter = ['verified', 'specialization', 'created_at']
    search_fields = ['full_name', 'slug', 'bio', 'specialization']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('full_name',)}
    fieldsets = (
        ('Personal Info', {
            'fields': ('full_name', 'slug', 'bio', 'avatar')
        }),
        ('Experience', {
            'fields': ('experience', 'specialization')
        }),
        ('Contact Info', {
            'fields': ('telegram_url', 'instagram_url', 'linkedin_url')
        }),
        ('Status', {
            'fields': ('verified',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['id','title', 'slug', 'category', 'mentor', 'course_center', 'level', 'price', 'average_rating', 'is_published', 'created_at']
    list_filter = ['level', 'is_published', 'category', 'course_center', 'created_at']
    search_fields = ['title', 'slug', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'reviews_count', 'students_count']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'description', 'thumbnail')
        }),
        ('Course Details', {
            'fields': ('category', 'mentor', 'course_center', 'level', 'language')
        }),
        ('Pricing & Duration', {
            'fields': ('price', 'duration_in_weeks', 'certificate_available')
        }),
        ('Statistics', {
            'fields': ('average_rating', 'reviews_count', 'students_count'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_published',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


class CourseTagItemInline(admin.TabularInline):
    model = CourseTagItem
    extra = 1


@admin.register(CourseTag)
class CourseTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name', 'slug']
    readonly_fields = ['id', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('Tag Info', {
            'fields': ('name', 'slug')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'id'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


@admin.register(CourseTagItem)
class CourseTagItemAdmin(admin.ModelAdmin):
    list_display = ['course', 'tag', 'created_at']
    list_filter = ['tag', 'created_at']
    search_fields = ['course__title', 'tag__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
