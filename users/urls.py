from django.urls import path
from .views import SignUpView, MyTokenObtainPairView, MyProfileView, ProfileUpdateView,ProfileDeleteView

urlpatterns = [
    path('signup/',SignUpView.as_view()),
    path('login/', MyTokenObtainPairView.as_view()),
    path('my/profile/', MyProfileView.as_view()),
    path('update/',ProfileUpdateView.as_view()),
    path('delete/',ProfileDeleteView.as_view()),
]
