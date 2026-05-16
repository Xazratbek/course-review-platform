from django.urls import path
from .views import *

urlpatterns = [
    path("comments/by_review/<uuid:uuid>/",CommentsListByReviewView.as_view()),
    path('comments/comment/',CommentCreateView.as_view()),
    path("comments/comment/<uuid:uuid>/", CommentUpdateDeleteView.as_view()),
    path("by_course/<slug:slug>/",ReviewListByCourseView.as_view()),
    path("create/",ReviewCreateView.as_view()),
    path('my/',MyReviewListView.as_view()),
    path("<uuid:uuid>/",ReviewRetrieveView.as_view()),
    path("delete/<uuid:uuid>/",ReviewDeleteView.as_view()),
    path("update/<uuid:uuid>/",ReviewUpdateView.as_view()),
    path('vote/',ReviewVoteToggleView.as_view()),
    path('media/upload/',ReviewMediaUploadView.as_view()),
    path('media/delete/<uuid:uuid>/',ReviewMediaDeleteView.as_view()),
]
