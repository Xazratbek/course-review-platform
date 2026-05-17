from django.urls import path
from .views import *

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name=""),
    path('centers/',CourseCenterListView.as_view(),name='course-center-list'),
    path('centers/<str:slug>/',CourseCenterRetrieveView.as_view(),name='course-center-list'),


    path('mentors/',MentorListView.as_view(),name='mentors-list'),
    path('mentors/<str:slug>/',MentorRetrieveView.as_view(),name='mentor-detail'),

    path("tags/", CourseTagListView.as_view(), name="course-tags"),
    path("tags/<slug:slug>/", CourseTagItemBySlugListView.as_view(), name="course-tags-by-slug"),

    path('',CourseListView.as_view(),name='course-list'),
    path('<slug:slug>/',CourseRetrieveView.as_view(),name='course-detail')
]
