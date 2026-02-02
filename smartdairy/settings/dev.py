"""
SmartDairy - Development settings
"""
import os
from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["*"])  # noqa: F405

# CORS - allow frontend in dev
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[  # noqa: F405
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
])
CORS_ALLOW_ALL_ORIGINS = True

# Database - use env var if available, else SQLite
if os.environ.get("DATABASE_URL"):
    pass  # Use DATABASE_URL from base settings
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
        }
    }

# Caching
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

# Debug toolbar
INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa: F405

INTERNAL_IPS = ["127.0.0.1", "172.0.0.0/8"]

# Email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Simplified static file serving
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"
