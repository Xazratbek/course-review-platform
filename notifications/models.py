from django.db import models
from core.models import BaseModel
from users.models import CustomUser


class NotificationType(models.TextChoices):
    REVIEW = "review", "Sharh"
    COMMENT = "comment", "Izoh"
    FAVORITE = "favorite", "Sevimli"
    MENTION = "mention", "Eslatma"
    SYSTEM = "system", "Tizim"
    PROMOTION = "promotion", "Aktsiya"

class Notification(BaseModel):
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=25, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(null=True,blank=True)

    def __str__(self):
        return f"{self.notification_type} - {self.title}"

    class Meta:
        db_table = "notifications"
        verbose_name = "Xabar"
        verbose_name_plural = "Xabarlar"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['receiver']),
            models.Index(fields=['is_read']),
            models.Index(fields=['created_at']),
        ]
