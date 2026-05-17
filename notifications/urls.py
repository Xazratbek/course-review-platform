from django.urls import path
from .views import *

urlpatterns = [
    path("",NotificationListView.as_view()),
    path("<uuid:uuid>/",NotificationRetrieveView.as_view()),
    path("mark_all/",MarkAsReadAllNotifications.as_view()),
    path("mark_one/",NotificationMarkReadView.as_view()),
]
