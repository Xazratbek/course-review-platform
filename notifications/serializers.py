from rest_framework import serializers
from .models import *

class NotificationListSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id','receiver','notification_type','notification_type_display','title','is_read']

    def get_notification_type_display(self,obj):
        return obj.get_notification_type_display()

class NotificationSerializer(serializers.ModelSerializer):
    receiver_username = serializers.CharField(source='receiver.username',read_only=True)
    notification_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id','receiver','receiver_username','notification_type','notification_type_display','title','body','is_read','metadata']


    def get_notification_type_display(self,obj):
        return obj.get_notification_type_display()