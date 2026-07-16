# Course Review Platform

Django REST API for a platform where students browse courses, course centers, and mentors, and leave ratings/reviews with moderation and notifications support.

Backend is written in Uzbek-domain terms (`Kurs`, `Sharh`, `Foydalanuvchi`, ...) — model verbose names and validation messages are in Uzbek.

## Tech Stack

- **Django 6.0** + **Django REST Framework**
- **djangorestframework-simplejwt** — JWT authentication
- **drf-spectacular** — OpenAPI schema / Swagger / Redoc docs
- **django-filter** — filtering & search on list endpoints
- **django-storages** + **boto3** — S3-compatible media storage (Supabase Storage)
- **django-environ** — `.env`-based settings
- SQLite (default local DB)

## Project Structure

```
config/          Django project settings, root URLs, WSGI/ASGI
core/            Shared abstract BaseModel (UUID pk, created_at/updated_at)
users/           Custom user model, auth (signup/login/JWT), profile
courses/         Categories, course centers, mentors, courses, tags
reviews/         Reviews, review votes, review media, comments
interactions/    Favorites, course view history, user activity log
moderation/      Reports and moderation actions on reviews
notifications/   User notifications
common/          Reserved app (currently no routes/models wired up)
```

Every domain model extends `core.models.BaseModel`, which provides a UUID primary key and `created_at`/`updated_at` timestamps.

## Setup

### 1. Clone & install dependencies

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

SUPABASE_PROJECT_ID=your-supabase-project-id
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

Media/static files are stored via S3-compatible storage (Supabase Storage), configured in `config/settings.py`.

### 3. Migrate & run

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API Documentation

- Swagger UI: `/api/schema/swagger/`
- Redoc: `/api/schema/redoc/`
- Raw OpenAPI schema: `/api/schema/`

## Authentication

JWT-based auth via SimpleJWT.

| Endpoint | Description |
|---|---|
| `POST /api/token/` | Obtain access/refresh token pair |
| `POST /api/token/refresh/` | Refresh access token |
| `POST /accounts/signup/` | Register a new user |

Access tokens are valid for 5 days, refresh tokens for 31 days. Send `Authorization: Bearer <access_token>` on authenticated requests.

## Main Endpoints

### Accounts (`/accounts/`)
- `POST signup/` — register
- `POST login/` — obtain JWT pair
- `GET my/profile/` — current user profile
- `PUT/PATCH update/` — update profile
- `DELETE delete/` — delete account
- `POST password/change/` — change password

### Courses (`/course/`)
- `GET categories/`
- `GET centers/`, `GET centers/<slug>/`
- `GET mentors/`, `GET mentors/<slug>/`
- `GET tags/`, `GET tags/<slug>/`
- `GET /` — list courses (filterable/searchable)
- `GET <slug>/` — course detail

### Reviews (`/reviews/`)
- `GET by_course/<slug>/` — reviews for a course
- `POST create/`, `PUT update/<uuid>/`, `DELETE delete/<uuid>/`
- `GET my/`, `GET <uuid>/`
- `POST vote/` — like/dislike a review
- `POST media/upload/`, `DELETE media/delete/<uuid>/`
- `GET comments/by_review/<uuid>/`, `POST comments/comment/`, `PUT/DELETE comments/comment/<uuid>/`

### Interactions (`/interactions/`)
- `POST favorites/toggle/`, `GET favorites/my/`
- `GET course/history/` — viewing history
- `GET activities/`, `GET activities/my/`, `GET activities/<uuid>/`

### Notifications (`/notifications/`)
- `GET /`, `GET <uuid>/`
- `POST mark_all/`, `POST mark_one/`

### Moderation (`/moderation/`)
- `GET my_reports/`
- `POST report/create/` — report a review

## Core Domain Models

- **CustomUser** — roles: `student`, `moderator`, `admin`
- **Course** — belongs to a `Category`, `Mentor`, `CourseCenter`; has level (`beginner`/`middle`/`pro`/`bootcamp`), language, price, rating aggregates
- **Review** — rating (1–5), status workflow (`pending` → `approved`/`rejected`), like/dislike counts
- **Comment** — threaded replies on reviews (`parent` / `reply_to`)
- **Report** / **ModerationAction** — review reporting and moderator actions
- **Notification** — typed user notifications (review, comment, favorite, mention, system, promotion)

## Notes

- `common` app is registered in `INSTALLED_APPS` but has no models/routes wired up yet.
- No test coverage is currently implemented (`tests.py` files are stubs across apps).
