# Koimeret Dairies - Smart Dairy Farm Management System

A comprehensive dairy farm management system built for Koimeret Enterprise Dairy in Chepalungu, Bomet, Kenya. Track cows, milk production, feed inventory, health events, sales, and daily tasks.

## Features

- **Cow Management**: Track individual cows with photos, breed info, status (milking, pregnant, dry, heifer)
- **Milk Production**: Daily milk logging (morning/evening sessions), production analytics
- **Feed Inventory**: Track feed purchases, usage, and inventory levels with reorder alerts
- **Health Tracking**: Record health events, treatments, vaccinations, and withdrawal periods
- **Sales Management**: Manage buyers, record sales, track payments
- **Task Management**: Daily task templates and completion tracking
- **Public Showcase**: Beautiful landing page to showcase your farm

## Tech Stack

### Backend
- Django 4.2 + Django REST Framework
- Wagtail 6.3 CMS
- PostgreSQL 15
- Redis (caching + Celery broker)
- Celery (background tasks)

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- React Icons

### Infrastructure
- Docker + Docker Compose
- Nginx (reverse proxy)
- GitHub Actions (CI/CD)

## Project Structure

```
smartdairy/
├── apps/                   # Django applications
│   ├── core/              # Core models (User, base classes)
│   ├── farm/              # Farm and membership management
│   ├── dairy/             # Cows and milk production
│   ├── feeds/             # Feed inventory management
│   ├── health/            # Health events and treatments
│   ├── sales/             # Sales and payments
│   ├── tasks/             # Task management
│   └── alerts/            # Alert system
├── frontend/              # Next.js frontend
├── docker/                # Docker configurations
│   ├── cms/              # Backend Dockerfile
│   ├── frontend/         # Frontend Dockerfile
│   └── nginx/            # Nginx configuration
├── smartdairy/           # Django project settings
├── templates/            # Django templates
├── static/               # Static files
├── docker-compose.yml    # Docker orchestration
└── manage.py
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone the repository
```bash
git clone https://github.com/HillaryKoros/smartdairy.git
cd smartdairy
```

### 2. Create environment file
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start with Docker
```bash
docker compose up -d
```

### 4. Initialize the database
```bash
docker compose exec cms python manage.py migrate
docker compose exec cms python manage.py initdb
docker compose exec cms python manage.py seeddata  # Optional: sample data
```

### 5. Access the application
- **Public Site**: http://localhost/
- **Login**: http://localhost/login
- **Admin**: http://localhost/admin (Phone: 0700000000, Password: admin123)

## Development

### Backend Development
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -e .

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

All API endpoints are under `/api/v1/`:

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/cows/` | List cows |
| `GET /api/v1/milk-logs/` | List milk logs |
| `GET /api/v1/feed-items/` | List feed items |
| `GET /api/v1/health-events/` | List health events |
| `GET /api/v1/sales/` | List sales |
| `GET /api/v1/tasks/` | List tasks |
| `GET /api/v1/dashboard/owner/` | Owner dashboard KPIs |
| `GET /api/v1/alerts/open/` | Open alerts |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `False` |
| `SECRET_KEY` | Django secret key | Required |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost` |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `/api/v1` |

## Deployment

### Production Deployment
1. Set up a server (e.g., Contabo VPS)
2. Configure SSH keys for GitHub Actions
3. Set GitHub secrets:
   - `SERVER_HOST` - Server IP address
   - `SERVER_USER` - SSH user (e.g., root)
   - `SERVER_SSH_KEY` - Private SSH key
4. Push to main branch to trigger deployment

## License

MIT License

## Contact

Koimeret Enterprise Dairy
Chepalungu, Bomet, Kenya
