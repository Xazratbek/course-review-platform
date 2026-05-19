from .serializers import *
from .models import *
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, RetrieveAPIView, DestroyAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .pagination import ReviewListByCoursePagination
from rest_framework.views import APIView
from .permissions import IsReviewOwner, IsCommentOwner
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from interactions.models import UserActivity
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

class CommentCreateView(CreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = CommentCreateSerializer

    def perform_create(self, serializer):
        metadata = {"activity_type":"comment create","comment_id": str(self.get_object().id),"time":timezone.now()}

        UserActivity.write_activity(user=request.user,activity_type='comment',metadata=metadata)

        serializer.save(user=self.request.user)

class CommentsListByReviewView(ListAPIView):
    serializer_class = CommentSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def get_queryset(self):
        return Comment.objects.filter(
            review_id=self.kwargs.get('uuid'),
            parent=None
        ).select_related(
            'user'
        ).prefetch_related(
            'thread_replies__user',
            'thread_replies__reply_to__user'
        ).order_by('-created_at')

class CommentUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsCommentOwner]
    parser_classes = [MultiPartParser,FormParser]
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def update(self, request, *args, **kwargs):
        metadata = {"activity_type":"destroy comment","comment_id": str(self.get_queryset().first().id),"time":timezone.now()}

        UserActivity.write_activity(user=request.user,activity_type='comment',metadata=metadata)

        return super().update(request, *args, **kwargs)

    def get_queryset(self):
        return Comment.objects.filter(
            id=self.kwargs.get('uuid'),
            parent=None
        ).select_related(
            'user'
        ).prefetch_related(
            'thread_replies__user',
            'thread_replies__reply_to__user'
        ).order_by('-created_at')

class ReviewListByCourseView(ListAPIView):
    serializer_class = ReviewDetailSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'
    pagination_class = ReviewListByCoursePagination

    def get_queryset(self):
        return Review.objects.filter(course__slug=self.kwargs.get('slug')).select_related('user','course').prefetch_related('media')

class ReviewCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewCreateSerializer

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)
        metadata = {"activity_type":"review create","review_id": str(review.id)}

        UserActivity.write_activity(user=self.request.user,activity_type='review',metadata=metadata)
        return review

class MyReviewListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MiniReviewSerializer

    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_fields = ['rating','is_verified_student']
    search_fields = ['title','advantages','disadvantages','body']

    def get_queryset(self):
        return self.request.user.reviews.all()

class ReviewUpdateView(UpdateAPIView):
    serializer_class = ReviewUpdateSerializer
    permission_classes = [IsReviewOwner]
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def put(self, request, *args, **kwargs):
        metadata = {"activity_type":"review update","review_id": str(self.get_queryset().first().id),"time":timezone.now()}

        UserActivity.write_activity(user=self.request.user,activity_type='review',metadata=metadata)
        return super().put(request, *args, **kwargs)

    def get_queryset(self):
        return Review.objects.all().select_related('user','course')

class ReviewDeleteView(DestroyAPIView):
    permission_classes = [IsReviewOwner]
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def destroy(self, request, *args, **kwargs):
        metadata = {"activity_type":"destroy review","review_id": str(self.get_queryset().first().id),"time":timezone.now()}

        UserActivity.write_activity(user=request.user,activity_type='review',metadata=metadata)
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        return Review.objects.all().select_related('user','course')

class ReviewRetrieveView(RetrieveAPIView):
    serializer_class = ReviewDetailSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def get_queryset(self):
        return Review.objects.all().select_related('user','course').prefetch_related('media')

class ReviewVoteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vote_type = request.data.get('vote_type','')
        serializer = ReviewVoteSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.validated_data['review']
            vote = ReviewVote.objects.filter(user=request.user,review=serializer.validated_data['review']).first()
            if vote:
                if vote.vote_type == vote_type:
                    vote.delete()
                    review.remove_vote(vote_type)
                    review.save()
                    return Response({
                        "status": status.HTTP_204_NO_CONTENT,
                        "message": f"{vote_type.title()}-o'chirildi"
                    }, status=status.HTTP_204_NO_CONTENT)

                elif vote_type == 'like' and vote.vote_type == 'dislike':
                    vote.vote_type = 'like'
                    review.change_vote(vote_type)
                    review.save()
                    vote.save()

                elif vote_type == 'dislike' and vote.vote_type == 'like':
                    vote.vote_type = 'dislike'
                    review.change_vote(vote_type)
                    review.save()
                    vote.save()

                    return Response({
                        "status": status.HTTP_200_OK,
                        "message": f"{vote_type.title()}d"
                    },status=status.HTTP_200_OK)

            else:
                vote = ReviewVote.objects.create(user=request.user,review=serializer.validated_data['review'],vote_type=vote_type)
                review.vote(vote.vote_type)
                review.save()
                return Response({
                    "status": status.HTTP_201_CREATED,
                    "message":f"{vote_type.title()}-d"
                })

class ReviewMediaUploadView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = ReviewMultipleMediaUploadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response({
            "status": status.HTTP_201_CREATED,
            "message":f"{result['media_count']}-ta rasm yuklandi",
            "review_id": result['review']
        },status=status.HTTP_201_CREATED)

class ReviewMediaDeleteView(DestroyAPIView):
    permission_classes = [IsReviewOwner]
    queryset = Review.objects.all().select_related('user').prefetch_related('media')
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def destroy(self, request, *args, **kwargs):
        review = self.get_queryset().first()
        if review.media.exists():
            for media in review.media.all():
                media.delete()

            return Response({
                "status": status.HTTP_204_NO_CONTENT,
                "message": "Rasmlar o'chirildi"
            },status=status.HTTP_204_NO_CONTENT)

        return Response({
            "status": status.HTTP_204_NO_CONTENT,
            "message": f"sharxning media filelari mavjud emas"
        },status=status.HTTP_204_NO_CONTENT)
