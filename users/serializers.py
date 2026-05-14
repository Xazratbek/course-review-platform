from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username','email','bio','role','phone_number','avatar','first_name','last_name']
        read_only_fields = ['email','username']

class SignUpSerializer(serializers.ModelSerializer):
    # password = serializers.CharField(write_only=True)
    class Meta:
        model = CustomUser
        fields = ['username','email','password','bio','role','phone_number','avatar']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            bio=validated_data.get('bio',''),
            role=validated_data.get('role',''),
            phone_number=validated_data.get('phone_number',''),
            avatar=validated_data.get('avatar',''),
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        full_name = f"{user.first_name} {user.last_name}".strip()
        token['username'] = user.username
        token['full_name'] = full_name or user.username
        token['email'] = user.email
        token['role'] = user.role

        return token