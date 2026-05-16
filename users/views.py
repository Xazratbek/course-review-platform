from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import SignUpSerializer, MyTokenObtainPairSerializer,CustomUserSerializer, PasswordChangeSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import CustomUser
from .permissions import IsProfileOwner
from rest_framework.permissions import IsAuthenticated

class SignUpView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):

        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)


        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class MyProfileView(APIView):
    permission_classes = [IsProfileOwner]

    def get(self, request):
        if request.user.is_authenticated:
            user = get_object_or_404(CustomUser,pk=request.user.pk)
            serializer = CustomUserSerializer(user)

            return Response(
                {
                    "status":status.HTTP_200_OK,
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

class ProfileUpdateView(APIView):
    permission_classes = [IsProfileOwner]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        print(request.user.pk)
        user = get_object_or_404(CustomUser,pk=request.user.pk)
        serializer = CustomUserSerializer(data=request.data,instance=user)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": status.HTTP_200_OK,
                "message": "Profil yangilandi",
                "data": serializer.data
            })

        return Response({
            "errors": serializer.errors
        })

    def patch(self, request):
        print(request.user.pk)
        user = get_object_or_404(CustomUser,pk=request.user.pk)
        serializer = CustomUserSerializer(data=request.data,instance=user,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": status.HTTP_200_OK,
                "message": "Profil qisman yangilandi",
                "data": serializer.data
            })

        return Response({
            "errors": serializer.errors
        })

class ProfileDeleteView(APIView):
    permission_classes = [IsProfileOwner]
    def delete(self, request):
        user = get_object_or_404(CustomUser, pk=request.user.pk)
        user.delete()
        return Response({
            "status": status.HTTP_204_NO_CONTENT,
            'message':"Akkaunt o'chirildi",
        })

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data,context={"request": request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({
                "status":status.HTTP_200_OK,
                "message": "Parol o'zgartirildi"
            },status=status.HTTP_200_OK)

        return Response({
            "errors":serializer.errors,
            "status": status.HTTP_400_BAD_REQUEST
        },status=status.HTTP_400_BAD_REQUEST)