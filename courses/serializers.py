from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CourseCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCenter
        fields = ['id','title','description','logo','website','telegram_url','instagram_url','verified']
        read_only_fields = ['verified']

class CourseMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'price']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'price','description','category','course_center','language','level','certificate_available']

# serializers.py
class MentorListSerializer(serializers.ModelSerializer):
    courses = CourseMiniSerializer(many=True,read_only=True)
    class Meta:
        model = Mentor
        fields = ['id','full_name', 'slug', 'avatar', 'specialization','courses']

class MentorDetailSerializer(serializers.ModelSerializer):
    courses = CourseMiniSerializer(many=True, read_only=True)
    class Meta:
        model = Mentor
        fields = ['id','full_name', 'slug', 'bio', 'avatar', 'experience', 'specialization', 'courses']

class CouresTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTag
        fields = ['id','name','slug']

class CourseTagItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTagItem
        fields = ['course','tag']

class CourseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'thumbnail',
            'category', 'mentor', 'course_center', 'level',
            'language', 'price', 'duration_in_weeks',
            'certificate_available', 'average_rating',
            'reviews_count', 'students_count', 'is_published'
        ]
        read_only_fields = [
            'id', 'slug', 'average_rating',
            'reviews_count', 'students_count'
        ]
