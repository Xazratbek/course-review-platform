from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CourseCenterPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            "course_centers_count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "course_centers": data
        })

class MentorPagination(PageNumberPagination):
    page_size = 15
    max_page_size = 100
    page_query_param = 'page_size'

    def get_paginated_response(self, data):
        return Response({
            "mentors_count": self.page.paginator.count,
            "next":self.get_next_link(),
            "previous": self.get_previous_link(),
            "mentors": data
        })

class CourseTagPagination(PageNumberPagination):
    page_size = 10
    max_page_size = 100
    page_query_param = 'page_size'

    def get_paginated_response(self, data):
        return Response({
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "tags":data,
        })

class CoursePagination(PageNumberPagination):
    page_size = 10
    max_page_size = 100
    page_query_param = 'page_size'

    def get_paginated_response(self, data):
        return Response({
            "courses_count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "courses": data
        })