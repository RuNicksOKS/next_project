from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone
import random
import string
from datetime import timedelta
import secrets

class User(models.Model):
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    nickname = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=255)  # 실제로는 해시된 비밀번호를 저장해야 함
    is_verified = models.BooleanField(default=False)  # 이메일 인증 여부
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_list'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.email})"

class EmailVerification(models.Model):
    email = models.EmailField()
    verification_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'email_verification'
        verbose_name = 'Email Verification'
        verbose_name_plural = 'Email Verifications'

    def save(self, *args, **kwargs):
        if not self.verification_code:
            # 6자리 랜덤 숫자 생성
            self.verification_code = ''.join(random.choices(string.digits, k=6))
        
        if not self.expires_at:
            # 10분 후 만료
            self.expires_at = timezone.now() + timedelta(minutes=10)
        
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.email} - {self.verification_code}"

class PasswordResetToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'password_reset_token'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'

    def save(self, *args, **kwargs):
        if not self.token:
            # 64자리 랜덤 토큰 생성
            self.token = secrets.token_urlsafe(48)
        
        if not self.expires_at:
            # 1시간 후 만료
            self.expires_at = timezone.now() + timedelta(hours=1)
        
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.email} - {self.token[:10]}..."
