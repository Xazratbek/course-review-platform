from django.db import models
from core.models import BaseModel
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


class CourseLevel(models.TextChoices):
    BEGINNER = "beginner", "Boshlang'ich daraja"
    MIDDLE = "middle", "O'rta daraja"
    PRO = "pro", "Pro daraja"
    BOOTCAMP = "bootcamp", "Bootcamp"


class LanguageChoices(models.TextChoices):
    UZBEK = "uz", "O'zbek"
    RUSSIAN = "ru", "Rus"
    ENGLISH = "en", "Ingliz"


class Category(BaseModel):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(unique=True)
    icon = models.ImageField(upload_to='category_icons/',null=True,blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "categories"
        verbose_name = "Kategoriya"
        verbose_name_plural = "Kategoriyalar"
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['name']),
        ]


class CourseCenter(BaseModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    logo = models.ImageField(upload_to='course_center_logos/',null=True,blank=True)
    website = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "course_centers"
        verbose_name = "O'quv markaz"
        verbose_name_plural = "O'quv markazlari"
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['title']),
            models.Index(fields=['verified']),
        ]


class Mentor(BaseModel):
    full_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    bio = models.TextField(null=True,blank=True)
    avatar = models.ImageField(upload_to='mentor_avatars/',null=True,blank=True)
    experience = models.PositiveIntegerField()
    specialization = models.CharField(max_length=255)
    instagram_url = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return self.full_name

    class Meta:
        db_table = "mentors"
        verbose_name = "Mentor"
        verbose_name_plural = "Mentorlar"
        indexes = [
            models.Index(fields=['full_name']),
            models.Index(fields=['slug']),
            models.Index(fields=['specialization']),
        ]

class Course(BaseModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(error_messages={"blank": "Kurs haqida qisqacha ta'rif yozish majburiy"})
    thumbnail = models.ImageField(upload_to='course_thumbnails/',blank=True,null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses')
    mentor = models.ForeignKey(Mentor, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    course_center = models.ForeignKey(CourseCenter, on_delete=models.CASCADE, related_name='courses')
    level = models.CharField(max_length=25, choices=CourseLevel.choices)
    language = models.CharField(max_length=10, choices=LanguageChoices.choices)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    duration_in_weeks = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    certificate_available = models.BooleanField(default=False)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    reviews_count = models.PositiveIntegerField(default=0)
    students_count = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "courses"
        verbose_name = "Kurs"
        verbose_name_plural = "Kurslar"
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['title']),
            models.Index(fields=['category']),
            models.Index(fields=['mentor']),
            models.Index(fields=['course_center']),
            models.Index(fields=['average_rating']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
        ]

class CourseTag(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "course_tags"
        verbose_name = "Kurs tegi"
        verbose_name_plural = "Kurs teglari"
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
        ]


class CourseTagItem(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tags')
    tag = models.ForeignKey(CourseTag, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return f"{self.course.title} - {self.tag.name}"

    class Meta:
        db_table = "course_tag_items"
        verbose_name = "Kurs tegi elementi"
        verbose_name_plural = "Kurs tegi elementlari"
        unique_together = ('course', 'tag')
