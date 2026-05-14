from rest_framework import serializers
from .models import *
from users.serializers import CustomUserSerializer
from courses.serializers import CourseMiniSerializer
class ReviewDetailSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    course = CourseMiniSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id','user','course','rating','title','advantages','disadvantages','body','is_verified_student','likes_count','dislikes_count','status']
        read_only_fields = ['user','course']

class MiniReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id','rating','title','likes_count','dislikes_count','is_verified_student']