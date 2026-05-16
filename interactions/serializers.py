from rest_framework import serializers
from .models import *
from users.models import CustomUser
from courses.models import Course
from rest_framework.exceptions import ValidationError
from users.serializers import MiniCustomUserSerializer

from courses.serializers import CourseMiniSerializer

class FavoriteToggleSerializer(serializers.ModelSerializer):
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    user = serializers.PrimaryKeyRelatedField(required=False,read_only=True)

    class Meta:
        model = Favorite
        fields = ['user','course']
        read_only_fields = ['user']


    def validate(self, attrs):
        course = attrs['course']
        if course:
            try:
                course = Course.objects.get(id=course.id)
                attrs['course'] = course
                return attrs

            except Favorite.DoesNotExist:
                raise ValidationError({"course":"Bunday course mavjud emas"})

        raise ValidationError({"course":"Kurs id kiritilishi shart"})

class FavoriteSerializer(serializers.ModelSerializer):
    course = CourseMiniSerializer(many=True,read_only=True)

    class Meta:
        model = Favorite
        fields = ['id','course']

class CourseViewHistorySerializer(serializers.ModelSerializer):
    course = CourseMiniSerializer(many=True,read_only=True)

    class Meta:
        model = Favorite
        fields = ['id','course']

class UserActivitySerializer(serializers.ModelSerializer):
    user__username = serializers.CharField(source='user.username',read_only=True)

    class Meta:
        model = UserActivity
        fields = ['id','user','user__username','activity_type','metadata']
        read_only_fields = ['user']