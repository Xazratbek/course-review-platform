from django.db import models
from django.contrib.auth.models import AbstractUser
from core.models import BaseModel

class UserRole(models.TextChoices):
    STUDENT = "student", "Talaba"
    MODERATOR = "moderator", "Moderator"
    ADMIN = "admin", "Admin"


class CustomUser(AbstractUser, BaseModel):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    role = models.CharField(
        max_length=25,
        choices=UserRole.choices,
        default=UserRole.STUDENT,
        db_index=True
    )
    phone_number = models.CharField(max_length=13, null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'accounts'
        verbose_name = "Foydalanuvchi"
        verbose_name_plural = "Foydalanuvchilar"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['role']),
        ]