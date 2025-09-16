from django.contrib import admin
from .models import User, EmailVerification, PasswordResetToken

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'nickname', 'username', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('email', 'nickname', 'username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('email', 'verification_code', 'is_verified', 'created_at', 'expires_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('email',)
    readonly_fields = ('created_at', 'expires_at')

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('email', 'token', 'is_used', 'created_at', 'expires_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('email',)
    readonly_fields = ('created_at', 'expires_at')
