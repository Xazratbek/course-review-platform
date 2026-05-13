from django.db import models
from core.models import BaseModel
from users.models import CustomUser
from courses.models import Course


class ActivityType(models.TextChoices):
    VIEW = "view", "Ko'rish"
    FAVORITE = "favorite", "Sevimlilarga qo'shish"
    REVIEW = "review", "Sharh qoldirish"
    COMMENT = "comment", "Izoh qoldirish"
    PURCHASE = "purchase", "Sotib olish"


class Favorite(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='favorites')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='favorited_by')

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

    class Meta:
        db_table = "favorites"
        verbose_name = "Sevimli"
        verbose_name_plural = "Sevimlillar"
        unique_together = ('user', 'course')


class CourseViewHistory(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='course_views')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='view_history')

    def __str__(self):
        return f"{self.user.username} viewed {self.course.title}"

    class Meta:
        db_table = "course_view_history"
        verbose_name = "Kurs ko'rish tarixi"
        verbose_name_plural = "Kurs ko'rish tarixlari"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['course']),
            models.Index(fields=['created_at']),
        ]


class UserActivity(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=25, choices=ActivityType.choices)
    metadata = models.JSONField()

    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"

    class Meta:
        db_table = "user_activities"
        verbose_name = "Foydalanuvchi faoliyati"
        verbose_name_plural = "Foydalanuvchi faoliyatlari"
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['activity_type']),
            models.Index(fields=['created_at']),
        ]
