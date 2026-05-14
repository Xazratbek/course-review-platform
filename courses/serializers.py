from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

class CourseCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCenter
        fields = [
            "id", "title", "description", "logo", "website",
            "telegram_url", "instagram_url", "verified",
        ]
        read_only_fields = ["verified"]
class CourseMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "slug", "thumbnail", "price",'rating', 'center', 'level']
class MentorListSerializer(serializers.ModelSerializer):
    courses = CourseMiniSerializer(many=True, read_only=True)
    class Meta:
        model = Mentor
        fields = ["id", "full_name", "slug", "avatar", "specialization", "courses"]

class MentorMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mentor
        fields = ['id','full_name','slug', "avatar", "specialization", "courses",'experience','is_verified']

class CouresTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTag
        fields = ["id", "name", "slug"]

class CourseTagItemSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='tag.id')
    name = serializers.ReadOnlyField(source='tag.name')
    slug = serializers.ReadOnlyField(source='tag.slug')
    class Meta:
        model = CourseTagItem
        fields = ['id','name','slug']

class CourseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    course_center = CourseCenterSerializer(read_only=True)
    mentor = MentorMiniSerializer(read_only=True)
    tags = CourseTagItemSerializer('tags',many=True,read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "description", "thumbnail",
            "category", "mentor", "course_center", "level",
            "language", "price", "duration_in_weeks",
            "certificate_available", "average_rating",
            "reviews_count", "students_count", "is_published",'tags'
        ]
        read_only_fields = [
            "id", "slug", "average_rating",
            "reviews_count", "students_count",'tags'
        ]

class MentorDetailSerializer(serializers.ModelSerializer):
    courses = CourseMiniSerializer(many=True, read_only=True)
    class Meta:
        model = Mentor
        fields = [
            "id", "full_name", "slug", "bio", "avatar",
            "experience", "specialization", "courses",
        ]
