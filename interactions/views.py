from .models import *
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone


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