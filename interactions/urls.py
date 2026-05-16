from django.urls import path
from .views import *

urlpatterns = [
    path('favorites/toggle/',FavoriteToggleView.as_view()),
    path('favorites/my/',FavoriteListView.as_view()),
    path('course/history/',MyCourseViewHistoryView.as_view()),
    path('activities/',AllUserActivityList.as_view()),
    path('activities/my/',MyActivities.as_view()),
    path('activities/<uuid:uuid>/',OneUserActivityList.as_view()),
]
