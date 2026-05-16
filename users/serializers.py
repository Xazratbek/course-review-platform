from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','username','email','bio','role','phone_number','avatar','first_name','last_name']
        read_only_fields = ['email','username']

class MiniCustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','username','role','avatar','email']

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
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

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user
        old = attrs.get('old_password')
        new = attrs.get('new_password')
        conf = attrs.get('confirm_password')

        if not user.check_password(old):
            raise ValidationError({"old_password":"Eski parol notog'ri kiritdingiz"})

        if old == new:
            raise ValidationError({
                "old_password":"Eski va yangi parol bir xil bo'lmasin yangi parol kiriting"
            })

        if new != conf:
            raise ValidationError({"confirm_password":"Yangi parollar bir biriga mos emas"})

        validate_password(new,self.context['request'].user)

        return attrs
