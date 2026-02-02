"""
SmartDairy - Production settings
"""
from .base import *  # noqa: F401, F403

DEBUG = env("DEBUG", default=False)  # noqa: F405

# CORS - allow frontend
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[  # noqa: F405
    "http://localhost:3000",
    "http://localhost",
])

# Security settings (relaxed for Docker dev)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Memcached
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.PyMemcacheCache",
        "LOCATION": env("MEMCACHED_URL", default="memcached:11211"),  # noqa: F405
        "TIMEOUT": 60 * 60 * 4,  # 4 hours
        "OPTIONS": {
            "no_delay": True,
            "ignore_exc": True,
            "max_pool_size": 4,
            "use_pooling": True,
        },
    }
}

# Static files with whitenoise
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Logging
LOGGING["handlers"]["file"] = {  # noqa: F405
    "class": "logging.FileHandler",
    "filename": "/var/log/smartdairy/django.log",
    "formatter": "verbose",
}
LOGGING["root"]["handlers"] = ["console", "file"]  # noqa: F405
