#!/bin/bash

# 데이터베이스가 준비될 때까지 대기
echo "Waiting for database..."
while ! nc -z db-dev 5432; do
  sleep 1
done
echo "Database is ready!"

# Django 마이그레이션 실행
echo "Running migrations..."
python manage.py makemigrations
python manage.py migrate

# 슈퍼유저 생성 (이미 존재하면 무시)
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"

# Django 개발 서버 실행
echo "Starting Django development server..."
python manage.py runserver 0.0.0.0:8000
