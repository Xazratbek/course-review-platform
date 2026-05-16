from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import *
from .serializers import *
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import ValidationError


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get('notification_id')
        nt = Notification.objects.filter(id=notification_id).first()
        if nt:
            if nt.receiver != request.user:
                raise ValidationError({"notification_id":"Birovning bildirishnomasini o'qilgan deb belgilab bo'lmaydi"})

            nt.is_read = True
            nt.save()
            return Response({
                "status":status.HTTP_200_OK,
                "message":"Bildirishnoma o'qilgan deb belgilandi"
            },status=status.HTTP_200_OK)

        else:
            return Response({
                "status":status.HTTP_400_BAD_REQUEST,
                "message":"Bunday bildirishnoma topilmadi"

         })

class MarkAsReadAllNotifications(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        notifications = user.notifications.all()
        if user.notifications.filter(is_read=False).exists():
            for nt in notifications:
                nt.is_read=True

            Notification.objects.bulk_update(notifications,['is_read'])
            return Response({
                "status":status.HTTP_200_OK,
                "message":"Barcha xabarlar o'qilgan deb belgilandi"
            },status=status.HTTP_200_OK)

        return Response({
            "status": status.HTTP_425_TOO_EARLY,
            "message":"O'qilgan deb belgilash uchun sizda bildirishnomalar yetarli emas"
        },status=status.HTTP_425_TOO_EARLY)

class NotificationListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationListSerializer

    def get_queryset(self):
        return self.request.user.notifications.filter(is_read=False)
