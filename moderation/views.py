from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from .pagination import *
from .permissions import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

class ReportCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReportCreateSerializer

class MyReportListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend,SearchFilter]
    filterset_fields = ['status']
    search_fields = ['reason','review__title']

    def get_queryset(self):
        return Report.objects.filter(user__id=self.request.id).select_related('review','reporter')
