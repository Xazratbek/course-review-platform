from rest_framework import serializers
from .models import *
from reviews.serializers import MiniReviewSerializer


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['reporter','review','reason']

class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username',read_only=True)
    review = MiniReviewSerializer(many=True)

    class Meta:
        model =  Report
        fields = ['id','reporter','review','reporter_username','reason','status']