from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone
import random
import string
from datetime import timedelta
import secrets
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# 1. 매니저 추가 (create_user를 가능하게 함)
class UserManager(BaseUserManager):
    def create_user(self, email, nickname, username, password=None):
        if not email:
            raise ValueError('이메일은 필수 항목입니다.')
        
        user = self.model(
            email=self.normalize_email(email),
            nickname=nickname,
            username=username,
        )
        user.set_password(password) # 비밀번호를 해시(암호화) 처리
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nickname, username, password=None):
        user = self.create_user(email, nickname, username, password)
        user.is_admin = True
        user.is_staff = True
        user.save(using=self._db)
        return user
    
class User(AbstractBaseUser):
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    nickname = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 이 모델을 관리할 매니저 연결 (이게 있어야 create_user를 찾음)
    objects = UserManager()

    # 로그인 시 ID로 사용할 필드
    USERNAME_FIELD = 'email'
    # 슈퍼유저 생성 시 추가로 물어볼 필드
    REQUIRED_FIELDS = ['username', 'nickname']

    class Meta:
        db_table = 'user_list'

    def __str__(self):
        return self.email

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
            # 숫자와 알파벳 혼합 6자리 코드 생성
            characters = string.ascii_uppercase + string.digits
            self.verification_code = ''.join(random.choices(characters, k=6))
        
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
