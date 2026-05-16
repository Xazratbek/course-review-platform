from rest_framework import serializers
from .models import *
from rest_framework.response import Response

class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id','reporter','review','reason']