from django.urls import path
from .views import FavoriteToggleView

urlpatterns = [
    path('favorite/toggle/',FavoriteToggleView.as_view()),
]
