from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from faker import Faker
import random
import json
from decimal import Decimal

from courses.models import Category, CourseCenter, Mentor, Course, CourseTag, CourseTagItem, LanguageChoices, CourseLevel
from reviews.models import Review, ReviewVote, ReviewMedia, Comment, ReviewStatus, VoteType
from interactions.models import Favorite, CourseViewHistory, UserActivity, ActivityType
from moderation.models import Report, ModerationAction, ReportStatus, ModerationActionType
from notifications.models import Notification, NotificationType
from users.models import CustomUser, UserRole

fake = Faker()
User = get_user_model()


class Command(BaseCommand):
    help = "Generate seed data for database"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("🔄 Starting seed data generation..."))

        # Clear existing data
        self.stdout.write(self.style.WARNING("🗑️  Clearing existing data..."))
        self.clear_data()

        # Create users
        self.stdout.write(self.style.SUCCESS("👥 Creating users..."))
        users = self.create_users()

        # Create categories
        self.stdout.write(self.style.SUCCESS("📂 Creating categories..."))
        categories = self.create_categories()

        # Create course centers
        self.stdout.write(self.style.SUCCESS("🏫 Creating course centers..."))
        course_centers = self.create_course_centers()

        # Create mentors
        self.stdout.write(self.style.SUCCESS("👨‍🏫 Creating mentors..."))
        mentors = self.create_mentors()

        # Create course tags
        self.stdout.write(self.style.SUCCESS("🏷️  Creating course tags..."))
        tags = self.create_course_tags()

        # Create courses
        self.stdout.write(self.style.SUCCESS("📚 Creating courses..."))
        courses = self.create_courses(categories, course_centers, mentors, tags)

        # Create reviews
        self.stdout.write(self.style.SUCCESS("⭐ Creating reviews..."))
        reviews = self.create_reviews(users, courses)

        # Create review votes
        self.stdout.write(self.style.SUCCESS("👍 Creating review votes..."))
        self.create_review_votes(users, reviews)

        # Create review media
        self.stdout.write(self.style.SUCCESS("🖼️  Creating review media..."))
        self.create_review_media(reviews)

        # Create comments
        self.stdout.write(self.style.SUCCESS("💬 Creating comments..."))
        self.create_comments(users, reviews)

        # Create favorites
        self.stdout.write(self.style.SUCCESS("❤️  Creating favorites..."))
        self.create_favorites(users, courses)

        # Create view history
        self.stdout.write(self.style.SUCCESS("👀 Creating view history..."))
        self.create_view_history(users, courses)

        # Create user activities
        self.stdout.write(self.style.SUCCESS("📊 Creating user activities..."))
        self.create_user_activities(users, courses)

        # Create reports
        self.stdout.write(self.style.SUCCESS("🚨 Creating reports..."))
        reports = self.create_reports(users, reviews)

        # Create moderation actions
        self.stdout.write(self.style.SUCCESS("⚖️  Creating moderation actions..."))
        self.create_moderation_actions(users, reviews, reports)

        # Create notifications
        self.stdout.write(self.style.SUCCESS("🔔 Creating notifications..."))
        self.create_notifications(users)

        self.stdout.write(self.style.SUCCESS("✅ Seed data generation completed successfully!"))

    def clear_data(self):
        """Clear all existing data"""
        Notification.objects.all().delete()
        ModerationAction.objects.all().delete()
        Report.objects.all().delete()
        UserActivity.objects.all().delete()
        CourseViewHistory.objects.all().delete()
        Favorite.objects.all().delete()
        Comment.objects.all().delete()
        ReviewMedia.objects.all().delete()
        ReviewVote.objects.all().delete()
        Review.objects.all().delete()
        CourseTagItem.objects.all().delete()
        CourseTag.objects.all().delete()
        Course.objects.all().delete()
        Mentor.objects.all().delete()
        CourseCenter.objects.all().delete()
        Category.objects.all().delete()
        CustomUser.objects.exclude(username='admin').delete()

    def create_users(self):
        """Create 50+ users with different roles"""
        users = []
        roles = [UserRole.STUDENT, UserRole.MODERATOR, UserRole.ADMIN]

        for i in range(50):
            username = f"user_{i+1}"
            email = f"user{i+1}@example.com"
            role = random.choice(roles)

            user = CustomUser.objects.create_user(
                username=username,
                email=email,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                password="password123",
                role=role,
                is_verified=random.choice([True, False]),
                bio=fake.text(max_nb_chars=200) if random.random() > 0.5 else "",
                phone_number=fake.phone_number()[:13] if random.random() > 0.5 else None,
            )
            users.append(user)

        return users

    def create_categories(self):
        """Create course categories"""
        category_names = [
            "Dasturlash",
            "Web Development",
            "Mobile App Development",
            "Data Science",
            "Machine Learning",
            "Cloud Computing",
            "DevOps",
            "UI/UX Design",
            "Digital Marketing",
            "Business",
        ]

        categories = []
        for name in category_names:
            category = Category.objects.create(
                name=name,
                slug=slugify(name),
            )
            categories.append(category)

        return categories

    def create_course_centers(self):
        """Create course centers"""
        course_centers = []
        for i in range(8):
            center = CourseCenter.objects.create(
                title=f"{fake.company()} Academy",
                slug=slugify(f"course-center-{i+1}"),
                description=fake.text(max_nb_chars=500),
                website=fake.url(),
                telegram_url=f"https://t.me/coursecenter{i+1}",
                instagram_url=f"https://instagram.com/coursecenter{i+1}",
                verified=random.choice([True, False]),
            )
            course_centers.append(center)

        return course_centers

    def create_mentors(self):
        """Create mentors"""
        mentors = []
        specializations = [
            "Backend Development",
            "Frontend Development",
            "Full Stack",
            "DevOps",
            "Data Science",
            "Mobile Development",
            "UI/UX Design",
            "Digital Marketing",
        ]

        for i in range(12):
            mentor = Mentor.objects.create(
                full_name=fake.name(),
                slug=slugify(f"mentor-{i+1}"),
                bio=fake.text(max_nb_chars=400),
                experience=random.randint(1, 20),
                specialization=random.choice(specializations),
                telegram_url=f"https://t.me/mentor{i+1}",
                instagram_url=f"https://instagram.com/mentor{i+1}",
                linkedin_url=f"https://linkedin.com/in/mentor{i+1}",
                verified=random.choice([True, False]),
            )
            mentors.append(mentor)

        return mentors

    def create_course_tags(self):
        """Create course tags"""
        tag_names = [
            "Python",
            "JavaScript",
            "React",
            "Django",
            "FastAPI",
            "Docker",
            "Kubernetes",
            "AWS",
            "Git",
            "SQL",
            "MongoDB",
            "REST API",
            "GraphQL",
            "Agile",
            "Testing",
        ]

        tags = []
        for name in tag_names:
            tag = CourseTag.objects.create(
                name=name,
                slug=slugify(name),
            )
            tags.append(tag)

        return tags

    def create_courses(self, categories, course_centers, mentors, tags):
        """Create courses"""
        courses = []
        course_titles = [
            "Python Basics",
            "Advanced JavaScript",
            "React Master Course",
            "Django Full Stack",
            "FastAPI Advanced",
            "Docker & Kubernetes",
            "AWS Complete Guide",
            "React Native Mobile",
            "Vue.js Fundamentals",
            "Angular Advanced",
            "Node.js Backend",
            "GraphQL API Design",
            "TypeScript Mastery",
            "Web Security",
            "Performance Optimization",
            "Microservices Architecture",
            "Database Design",
            "API Testing",
            "CI/CD Pipeline",
            "Cloud Native Development",
        ]

        for title in course_titles:
            course = Course.objects.create(
                title=title,
                slug=slugify(title),
                description=fake.text(max_nb_chars=600),
                category=random.choice(categories),
                mentor=random.choice(mentors),
                course_center=random.choice(course_centers),
                level=random.choice(CourseLevel.choices)[0],
                language=random.choice(LanguageChoices.choices)[0],
                price=Decimal(random.uniform(10, 500)).quantize(Decimal('0.01')),
                duration_in_weeks=random.randint(4, 24),
                certificate_available=random.choice([True, False]),
                average_rating=Decimal(random.uniform(3.5, 5.0)).quantize(Decimal('0.01')),
                is_published=random.choice([True, False]),
            )

            # Add random tags
            course_tags = random.sample(tags, k=random.randint(2, 5))
            for tag in course_tags:
                CourseTagItem.objects.create(course=course, tag=tag)

            courses.append(course)

        return courses

    def create_reviews(self, users, courses):
        """Create reviews"""
        reviews = []
        advantages_list = [
            "Очень доступный материал",
            "Отличный преподаватель",
            "Практические примеры",
            "Хорошее объяснение",
            "Много домашних заданий",
        ]
        disadvantages_list = [
            "Кратко по некоторым темам",
            "Могло быть больше примеров",
            "Слишком быстро",
            "Нужно больше практики",
            "Некоторые темы сложные",
        ]

        for course in courses:
            # 5-15 reviews per course
            num_reviews = random.randint(5, 15)
            for _ in range(num_reviews):
                user = random.choice(users)

                # Check if user already reviewed this course
                if Review.objects.filter(user=user, course=course).exists():
                    continue

                review = Review.objects.create(
                    user=user,
                    course=course,
                    rating=random.randint(1, 5),
                    title=fake.sentence(nb_words=6),
                    advantages=random.choice(advantages_list),
                    disadvantages=random.choice(disadvantages_list),
                    body=fake.text(max_nb_chars=500),
                    is_verified_student=random.choice([True, False]),
                    status=random.choice(ReviewStatus.choices)[0],
                )
                reviews.append(review)

        return reviews

    def create_review_votes(self, users, reviews):
        """Create review votes"""
        for review in reviews[:len(reviews)//2]:
            # 2-8 votes per review
            num_votes = random.randint(2, 8)
            voted_users = random.sample(users, min(num_votes, len(users)))

            for user in voted_users:
                # Check if user already voted
                if ReviewVote.objects.filter(user=user, review=review).exists():
                    continue

                ReviewVote.objects.create(
                    user=user,
                    review=review,
                    vote_type=random.choice(VoteType.choices)[0],
                )

    def create_review_media(self, reviews):
        """Create review media"""
        for review in reviews[:len(reviews)//3]:
            if random.random() > 0.7:
                num_media = random.randint(1, 3)
                for _ in range(num_media):
                    ReviewMedia.objects.create(
                        review=review,
                    )

    def create_comments(self, users, reviews):
        """Create comments on reviews"""
        for review in reviews:
            if random.random() > 0.6:
                num_comments = random.randint(1, 5)
                comments = []
                for _ in range(num_comments):
                    comment = Comment.objects.create(
                        review=review,
                        user=random.choice(users),
                        body=fake.text(max_nb_chars=300),
                        parent=random.choice(comments) if comments and random.random() > 0.7 else None,
                    )
                    comments.append(comment)

    def create_favorites(self, users, courses):
        """Create favorite courses"""
        for user in users:
            num_favorites = random.randint(0, 10)
            favorite_courses = random.sample(courses, min(num_favorites, len(courses)))

            for course in favorite_courses:
                try:
                    Favorite.objects.create(user=user, course=course)
                except:
                    pass

    def create_view_history(self, users, courses):
        """Create course view history"""
        for user in users:
            num_views = random.randint(5, 25)
            viewed_courses = random.sample(courses, min(num_views, len(courses)))

            for course in viewed_courses:
                CourseViewHistory.objects.create(user=user, course=course)

    def create_user_activities(self, users, courses):
        """Create user activities"""
        activity_types = [ActivityType.VIEW, ActivityType.FAVORITE, ActivityType.REVIEW, ActivityType.COMMENT, ActivityType.PURCHASE]

        for user in users:
            num_activities = random.randint(10, 30)
            for _ in range(num_activities):
                UserActivity.objects.create(
                    user=user,
                    activity_type=random.choice(activity_types),
                    metadata={
                        "course_id": str(random.choice(courses).id),
                        "timestamp": fake.iso8601(),
                        "ip_address": fake.ipv4(),
                    },
                )

    def create_reports(self, users, reviews):
        """Create review reports"""
        reports = []
        report_reasons = [
            "Inappropriate content",
            "Spam",
            "Offensive language",
            "False information",
            "Plagiarism",
            "Adult content",
        ]

        for review in reviews[:len(reviews)//4]:
            if random.random() > 0.8:
                num_reports = random.randint(1, 3)
                for _ in range(num_reports):
                    reporter = random.choice(users)

                    # Check if already reported
                    if Report.objects.filter(reporter=reporter, review=review).exists():
                        continue

                    report = Report.objects.create(
                        reporter=reporter,
                        review=review,
                        reason=random.choice(report_reasons),
                        status=random.choice(ReportStatus.choices)[0],
                    )
                    reports.append(report)

        return reports

    def create_moderation_actions(self, users, reviews, reports):
        """Create moderation actions"""
        moderators = [u for u in users if u.role in [UserRole.MODERATOR, UserRole.ADMIN]]

        for review in reviews[:len(reviews)//6]:
            if random.random() > 0.85 and moderators:
                action = ModerationAction.objects.create(
                    moderator=random.choice(moderators),
                    review=review,
                    action=random.choice(ModerationActionType.choices)[0],
                    reason=fake.text(max_nb_chars=200),
                )

    def create_notifications(self, users):
        """Create notifications"""
        notification_types = [
            NotificationType.REVIEW,
            NotificationType.COMMENT,
            NotificationType.FAVORITE,
            NotificationType.MENTION,
            NotificationType.SYSTEM,
            NotificationType.PROMOTION,
        ]

        for user in users:
            num_notifications = random.randint(5, 20)
            for _ in range(num_notifications):
                Notification.objects.create(
                    receiver=user,
                    notification_type=random.choice(notification_types),
                    title=fake.sentence(nb_words=8),
                    body=fake.text(max_nb_chars=300),
                    is_read=random.choice([True, False]),
                    metadata={
                        "action_type": "view",
                        "object_id": random.randint(1, 100),
                    },
                )
