from django.db import models
from core.models import BaseModel
from users.models import CustomUser
from reviews.models import Review


class ReportStatus(models.TextChoices):
    PENDING = "pending", "Tekshirilayotgan"
    APPROVED = "approved", "Tasdiqlangan"
    REJECTED = "rejected", "Rad etilgan"
    RESOLVED = "resolved", "Hal qilingan"


class ModerationActionType(models.TextChoices):
    DELETE = "delete", "O'chirish"
    SUSPEND = "suspend", "To'xtatish"
    RESTORE = "restore", "Qayta tiklash"
    WARN = "warn", "Ogohlanish"


class Report(BaseModel):
    reporter = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reports_submitted')
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='reports')
    reason = models.TextField()
    status = models.CharField(
        max_length=25,
        choices=ReportStatus.choices,
        default=ReportStatus.PENDING
    )

    def __str__(self):
        return f"Report {self.id} - {self.status}"

    class Meta:
        db_table = "reports"
        verbose_name = "Xabar"
        verbose_name_plural = "Xabarlar"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]


class ModerationAction(BaseModel):
    moderator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='moderation_actions')
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='moderation_actions')
    action = models.CharField(max_length=25, choices=ModerationActionType.choices)
    reason = models.TextField()

    def __str__(self):
        return f"Action {self.action} by {self.moderator.username}"

    class Meta:
        db_table = "moderation_actions"
        verbose_name = "Moderatsiya amali"
        verbose_name_plural = "Moderatsiya amalları"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['moderator']),
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
        ]
