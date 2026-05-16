from rest_framework import serializers
from .models import *
from users.serializers import CustomUserSerializer, MiniCustomUserSerializer
from courses.serializers import CourseMiniSerializer
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404

class ReviewMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewMedia
        fields = ['id','review','image']

class ReviewDetailSerializer(serializers.ModelSerializer):
    user = MiniCustomUserSerializer(read_only=True)
    course = CourseMiniSerializer(read_only=True)
    media = ReviewMediaSerializer(read_only=True,many=True)

    class Meta:
        model = Review
        fields = ['id','user','course','rating','title','advantages','disadvantages','body','is_verified_student','likes_count','dislikes_count','status','media']
        read_only_fields = ['user','course','media']

class ReviewCreateSerializer(serializers.ModelSerializer):
    title = serializers.CharField(min_length=15,max_length=255)
    class Meta:
        model = Review
        fields = ['course','rating','title','body','advantages','disadvantages']

    def validate(self, attrs):
        advantages = attrs.get('advantages','')
        disadvantages = attrs.get('disadvantages','')

        if advantages == disadvantages:
            raise ValidationError({"advantages":"Yaxshi va yomon tomonlarini alohida ko'rsating ikkisiga xam bir xil matn yozib bo'lmaydi"})

        return attrs

class MiniReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id','rating','title','likes_count','dislikes_count','is_verified_student']

class ReviewUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['title','body','advantages','disadvantages','body']

class ReviewVoteSerializer(serializers.Serializer):
    review_id = serializers.UUIDField(write_only=True)
    vote_type = serializers.CharField(write_only=True)

    def validate_vote_type(self, value):
        if value.lower().strip() not in ['like','dislike']:
            raise ValidationError({"vote_type":"Faqat like yoki dislike bosish mumkin"})

        return value

    def validate(self, attrs):
        review_id = attrs.get('review_id','')
        if review_id:
            try:
                review = Review.objects.get(id=review_id)
                attrs['review'] = review

            except Review.DoesNotExist:
                raise ValidationError({"review_id":"Bunday sharx mavjud emas"})

            return attrs

        return ValidationError({"review_id":"Review id berilishi shart"})

class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(
        source='user.username',
        read_only=True
    )
    replies = serializers.SerializerMethodField()
    reply_to_username = serializers.CharField(
        source='reply_to.user.username',
        read_only=True)
    class Meta:
        model = Comment
        fields = [
            'id',
            'review',
            'user',
            'user_username',
            'body',
            'reply_to',
            'reply_to_username',
            'created_at',
            'replies'
        ]

    def get_replies(self, obj):
        if obj.parent is not None:
            return []

        replies = obj.thread_replies.select_related(
            'user',
            'reply_to__user'
        )
        return CommentSerializer(
            replies,
            many=True,
            context=self.context
        ).data

    def validate(self, attrs):
        parent = attrs.get('parent')
        review = attrs.get('review')
        if parent and parent.review != review:
            raise ValidationError({"parent":"Javob yozilayotgan sharh ushbu dars/kurs sharhiga tegishli emas."})

        return attrs

class CommentCreateSerializer(serializers.ModelSerializer):
    reply_to = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        required=False,
        allow_null=True
    )
    class Meta:
        model = Comment
        fields = ['review', 'body', 'reply_to']
    def create(self, validated_data):
        user = validated_data.pop('user')
        reply_to = validated_data.pop('reply_to', None)
        review = validated_data['review']
        parent = None
        if reply_to:
            if review != reply_to.review:
                raise serializers.ValidationError({
                    "reply_to": "Boshqa review commentiga reply qilib bo'lmaydi"
                })
            if reply_to.parent is None:
                parent = reply_to
            else:
                parent = reply_to.parent

        comment = Comment.objects.create(
            user=user,
            parent=parent,
            reply_to=reply_to,
            **validated_data
        )
        return comment

class ReviewMediaUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewMedia
        fields = ['review','image']

class ReviewMultipleMediaUploadSerializer(serializers.Serializer):
    review = serializers.UUIDField(write_only=True)
    images = serializers.ListField(
        child=serializers.ImageField(max_length=100000,allow_empty_file=True,use_url=False,write_only=True)
    )

    def create(self, validated_data):
        review_id = validated_data['review']
        images = validated_data['images']

        media_objects = []
        for image in images:
            media_objects.append(ReviewMedia(review_id=review_id,image=image))

        created_media = ReviewMedia.objects.bulk_create(media_objects)
        return {"review": review_id,'media_count': len(created_media) }