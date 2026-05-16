from django.db import models
from core.models import BaseModel
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import CustomUser
from courses.models import Course
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

class ReviewStatus(models.TextChoices):
    PENDING = "pending", "Tekshirilayotgan"
    APPROVED = "approved", "Tasdiqlangan"
    REJECTED = "rejected", "Rad etilgan"


class VoteType(models.TextChoices):
    LIKE = "like", "Yoqdi"
    DISLIKE = "dislike", "Yoqmadi"


class Review(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=255)
    advantages = models.TextField(null=True,blank=True)
    disadvantages = models.TextField(null=True,blank=True)
    body = models.TextField(null=True,blank=True)
    is_verified_student = models.BooleanField(default=False)
    likes_count = models.PositiveIntegerField(default=0)
    dislikes_count = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=25,
        choices=ReviewStatus.choices,
        default=ReviewStatus.PENDING
    )

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

    def vote(self,vote_type):
        try:

            if vote_type == 'like':
                self.likes_count += 1
                self.save()
            else:
                self.dislikes_count += 1
                self.save()

        except IntegrityError:
            return ValidationError({"vote_type":f"{vote_type}-soni 0-ga teng ayirib bo'lmaydi"})

    def remove_vote(self, vote_type):
        try:

            if vote_type == 'like':
                self.likes_count -= 1
                self.save()
            else:
                self.dislikes_count -= 1
                self.save()

        except IntegrityError:
            return ValidationError({"vote_type":f"{vote_type}-soni 0-ga teng ayirib bo'lmaydi"})

    def change_vote(self, vote_type):
        try:

            if vote_type == 'like':
                self.likes_count -= 1
                self.dislikes_count += 1
                self.save()

            elif vote_type == 'dislike':
                self.dislikes_count += 1
                self.likes_count -= 1
                self.save()

        except IntegrityError:
            return ValidationError({"vote_type":f"{vote_type}-soni 0-ga teng ayirib bo'lmaydi"})

    class Meta:
        db_table = "reviews"
        verbose_name = "Sharh"
        verbose_name_plural = "Sharhlar"
        unique_together = ('user', 'course')
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['course']),
            models.Index(fields=['rating']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]


class ReviewVote(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='review_votes')
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=10, choices=VoteType.choices)

    def __str__(self):
        return f"{self.user.username} - {self.vote_type} - {self.review.id}"

    class Meta:
        db_table = "review_votes"
        verbose_name = "Sharh ovozi"
        verbose_name_plural = "Sharh ovozlari"
        unique_together = ('user', 'review')


class ReviewMedia(BaseModel):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='media')
    image = models.ImageField(upload_to='review_media/')

    def __str__(self):
        return f"Media for {self.review.id}"

    class Meta:
        db_table = "review_media"
        verbose_name = "Sharh media"
        verbose_name_plural = "Sharh medialari"


class Comment(BaseModel):
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    body = models.TextField()
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='thread_replies'
    )
    reply_to = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='direct_replies'
    )

    def __str__(self):
        return f"{self.user.username} - {self.review.id}"

    class Meta:
        db_table = "comments"
        verbose_name = "Izoh"
        verbose_name_plural = "Izohlar"
        indexes = [
            models.Index(fields=['review']),
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]
