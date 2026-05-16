from .serializers import *
from .models import *
from django.db.models import Prefetch
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .pagination import *
from interactions.models import CourseViewHistory, UserActivity
from django.utils.timezone import now

class CategoryListView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CourseCenterListView(ListAPIView):
    queryset = CourseCenter.objects.prefetch_related('courses')
    serializer_class = CourseCenterSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    pagination_class = CourseCenterPagination

    filterset_fields = ['verified', 'title', 'description', 'website']
    search_fields = ['title', 'description', 'website']

class CourseCenterRetrieveView(RetrieveAPIView):
    queryset = CourseCenter.objects.all()
    serializer_class = CourseCenterSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def retrieve(self, request, *args, **kwargs):
        metadata = {"activity_type":"view","course_center_id": str(self.get_queryset().first().id),"view":"course_center","time":str(now())}

        UserActivity.objects.create(user=request.user,activity_type='view',metadata=metadata)

        return super().retrieve(request, *args, **kwargs)

class MentorListView(ListAPIView):
    queryset = Mentor.objects.prefetch_related(Prefetch(
        'courses',queryset=Course.objects.filter(is_published=True).only('id', 'title', 'slug', 'thumbnail', 'price','average_rating', 'course_center', 'level')
    ))
    serializer_class = MentorListSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter]
    filterset_fields = ['experience','specialization','verified']
    search_fields = ['full_name','bio','specialization']
    pagination_class = MentorPagination

class MentorRetrieveView(RetrieveAPIView):
    queryset = Mentor.objects.prefetch_related('courses')
    serializer_class = MentorDetailSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def retrieve(self, request, *args, **kwargs):
        metadata = {"activity_type":"view","mentor_id": str(self.get_queryset().first().id),"view":"mentor","time":str(now())}

        UserActivity.objects.create(user=request.user,activity_type='view',metadata=metadata)

        return super().retrieve(request, *args, **kwargs)

class CourseTagListView(ListAPIView):
    queryset = CourseTag.objects.all()
    serializer_class = CouresTagSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter]
    search_fields = ['name']
    pagination_class = CourseTagPagination

class CourseListView(ListAPIView):
    queryset = Course.objects.filter(is_published=True).only('id', 'title', 'slug', 'thumbnail', 'price','description','category','course_center','language','level','certificate_available')
    serializer_class = CourseSerializer
    pagination_class = CoursePagination
    filter_backends = [DjangoFilterBackend,filters.SearchFilter]
    search_fields = ['title','description','language']
    filter_fields = ['price','category','course_center','language','level','certificate_available']

class CourseRetrieveView(RetrieveAPIView):
    serializer_class = CourseSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def get_queryset(self):
        return Course.objects.filter(slug=self.kwargs.get('slug')).select_related('category','mentor','course_center').prefetch_related('tags')

    def retrieve(self, request, *args, **kwargs):
        metadata = {"activity_type":"view","course_id": str(self.get_queryset().first().id),"view":"course","time":str(now())}

        UserActivity.objects.create(user=request.user,activity_type='view',metadata=metadata)
        CourseViewHistory.objects.get_or_create(user=request.user,course=self.get_queryset().first())
        return super().retrieve(request, *args, **kwargs)