from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class ReviewListByCoursePagination(PageNumberPagination):
    page_query_param = 'page_size'
    max_page_size = 100
    page_size = 10

    def get_paginated_response(self, data):
        return Response({
            "reviews_count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous":self.get_previous_link(),
            "reviews": data
        })