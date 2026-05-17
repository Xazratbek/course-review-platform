from django.urls import path
from .views import MyReportListView, ReportCreateView

urlpatterns = [
    path('my_reports/',MyReportListView.as_view()),
    path('report/create/',ReportCreateView.as_view()),
]
