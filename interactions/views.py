from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from rest_framework.generics import ListAPIView
from .pagination import FavoritePagination, CourseViewHistoryPagination, UserActivityPagination
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FavoriteToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        favorite,created = Favorite.objects.get_or_create(user=request.user,course=serializer.validated_data['course'])
        metadata = {"activity_type":"favorite","course_id": str(serializer.validated_data['course'].id),"time":timezone.now()}

        UserActivity.write_activity(user=request.user,activity_type='favorite',metadata=metadata)

        if not created:
            favorite.delete()
            return Response({
                "status": status.HTTP_204_NO_CONTENT,
                "message":"Saqlanganlardan o'chirildi",
            },status=status.HTTP_204_NO_CONTENT)

        return Response({
            "status":status.HTTP_201_CREATED,
            "message":"Saqlanganlarga qo'shildi",
        },status=status.HTTP_201_CREATED)

class FavoriteListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer
    pagination_class = FavoritePagination
    filter_backends = [DjangoFilterBackend,SearchFilter]
    search_fields = ['course__title','course__description']

    def get_queryset(self):
        return  self.request.user.favorites.all().select_related('course')

class MyCourseViewHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseViewHistorySerializer
    pagination_class = CourseViewHistoryPagination

    def get_queryset(self):
        return self.request.user.course_views.all().select_related('course')

class AllUserActivityList(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserActivitySerializer
    queryset = UserActivity.objects.all().select_related('user')
    pagination_class = UserActivityPagination

class OneUserActivityList(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserActivitySerializer
    pagination_class = UserActivityPagination
    lookup_field = 'id'
    lookup_url_kwarg = 'uuid'

    def get_queryset(self):
        return UserActivity.objects.filter(user__id=self.kwargs.get('uuid')).select_related('user')

class MyActivities(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserActivitySerializer
    pagination_class = UserActivityPagination

    def get_queryset(self):
        user = self.request.user
        return UserActivity.objects.filter(user=user)
