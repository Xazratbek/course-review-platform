from rest_framework.pagination import PageNumberPagination
from .models import Favorite
from rest_framework.response import Response
from rest_framework import status

class FavoritePagination(PageNumberPagination):
    page_query_param = 'page_size'
    page_size = 10
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "favorite_count": self.page.paginator.count,
            "status": status.HTTP_200_OK,
            "next":self.get_next_link(),
            "previous": self.get_previous_link(),
            "favorites": data
        })

class CourseViewHistoryPagination(PageNumberPagination):
    page_query_param = 'page_size'
    page_size = 10
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "course_views_count": self.page.paginator.count,
            "status": status.HTTP_200_OK,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "course_history": data
        })

class UserActivityPagination(PageNumberPagination):
    page_query_param = 'page_size'
    paeg_size = 30
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "status": status.HTTP_200_OK,
            "next":self.get_next_link(),
            "previous": self.get_previous_link(),
            "activities": data
        })