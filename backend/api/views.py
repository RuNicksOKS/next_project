from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from .models import User, EmailVerification, PasswordResetToken
import re

class TestViewSet(viewsets.ViewSet):
    """
    간단한 테스트 API ViewSet
    """
    
    @action(detail=False, methods=['get'])
    def hello(self, request):
        """
        Hello World API 엔드포인트
        """
        return Response({
            'message': 'Hello from Django Backend!',
            'status': 'success'
        })
    
    @action(detail=False, methods=['get'])
    def health(self, request):
        """
        헬스 체크 API 엔드포인트
        """
        return Response({
            'status': 'healthy',
            'service': 'Django Backend',
            'version': '1.0.0'
        })
    
    @action(detail=False, methods=['post'])
    def signup(self, request):
        """
        회원가입 API 엔드포인트
        """
        try:
            data = request.data
            
            # 필수 필드 검증
            required_fields = ['email', 'nickname', 'username', 'password', 'confirmPassword']
            for field in required_fields:
                if field not in data or not data[field]:
                    return Response({
                        'success': False,
                        'error': f'{field} 필드는 필수입니다.',
                        'field': field
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # 이메일 형식 검증
            email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_regex, data['email']):
                return Response({
                    'success': False,
                    'error': '올바른 이메일 형식이 아닙니다.',
                    'field': 'email'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 비밀번호 일치 검증
            if data['password'] != data['confirmPassword']:
                return Response({
                    'success': False,
                    'error': '비밀번호가 일치하지 않습니다.',
                    'field': 'password'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 이메일 중복 검사
            if User.objects.filter(email=data['email']).exists():
                return Response({
                    'success': False,
                    'error': '이미 존재하는 이메일입니다.',
                    'field': 'email'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 이메일 인증이 완료되었는지 확인
            email_verification = EmailVerification.objects.filter(
                email=data['email'],
                is_verified=True
            ).first()
            
            if not email_verification:
                return Response({
                    'success': False,
                    'error': '이메일 인증이 필요합니다.',
                    'field': 'email'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 사용자 생성
            user = User.objects.create_user(
                email=data['email'],
                nickname=data['nickname'],
                username=data['username'],
                password=data['password']
            )
            # 이메일 인증 완료 처리
            user.is_verified = True
            user.save()
            
            # 인증 완료된 이메일 인증 레코드 삭제
            email_verification.delete()
            
            return Response({
                'success': True,
                'message': '회원가입이 완료되었습니다.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'nickname': user.nickname,
                    'username': user.username,
                    'created_at': user.created_at
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': '서버 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def send_verification_email(self, request):
        """
        이메일 인증번호 전송 API
        """
        try:
            data = request.data
            email = data.get('email')
            
            if not email:
                return Response({
                    'success': False,
                    'error': '이메일이 필요합니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 이메일 형식 검증
            email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_regex, email):
                return Response({
                    'success': False,
                    'error': '올바른 이메일 형식이 아닙니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 이미 가입된 이메일인지 확인
            if User.objects.filter(email=email).exists():
                return Response({
                    'success': False,
                    'error': '이미 가입된 이메일입니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 기존 인증번호 삭제
            EmailVerification.objects.filter(email=email).delete()
            
            # 새로운 인증번호 생성
            verification = EmailVerification.objects.create(email=email)
            
            # 이메일 전송
            subject = 'Next.js 회원가입 인증번호'
            message = f'''
                안녕하세요!

                Next.js 회원가입을 위한 인증번호입니다.

                인증번호: {verification.verification_code}

                이 인증번호는 10분 후 만료됩니다.
                인증번호를 입력하여 회원가입을 완료해주세요.

                감사합니다.
                Next.js 팀
            '''
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                
                return Response({
                    'success': True,
                    'message': '인증번호가 전송되었습니다.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                # 이메일 전송 실패 시 인증 레코드 삭제
                verification.delete()
                return Response({
                    'success': False,
                    'error': '이메일 전송에 실패했습니다. 다시 시도해주세요.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': '서버 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        """
        이메일 인증번호 검증 API
        """
        try:
            data = request.data
            email = data.get('email')
            verification_code = data.get('verification_code')
            
            if not email or not verification_code:
                return Response({
                    'success': False,
                    'error': '이메일과 인증번호가 필요합니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 인증번호 검증
            verification = EmailVerification.objects.filter(
                email=email,
                verification_code=verification_code
            ).first()
            
            if not verification:
                return Response({
                    'success': False,
                    'error': '인증번호가 올바르지 않습니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if verification.is_expired():
                verification.delete()
                return Response({
                    'success': False,
                    'error': '인증번호가 만료되었습니다. 다시 요청해주세요.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 인증 완료 처리
            verification.is_verified = True
            verification.save()
            
            return Response({
                'success': True,
                'message': '이메일 인증이 완료되었습니다.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': '서버 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        """
        비밀번호 재설정 요청 API
        """
        try:
            data = request.data
            email = data.get('email')
            username = data.get('username')
            
            if not email or not username:
                return Response({
                    'success': False,
                    'error': '이메일과 사용자명이 필요합니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 이메일 형식 검증
            email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            if not re.match(email_regex, email):
                return Response({
                    'success': False,
                    'error': '올바른 이메일 형식이 아닙니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 사용자 존재 여부 확인
            user = User.objects.filter(email=email, username=username).first()
            if not user:
                return Response({
                    'success': False,
                    'error': '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 기존 토큰 삭제
            PasswordResetToken.objects.filter(email=email).delete()
            
            # 새로운 토큰 생성
            reset_token = PasswordResetToken.objects.create(email=email)
            
            # 비밀번호 재설정 URL 생성
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
            
            # 이메일 전송
            subject = 'Next.js 비밀번호 재설정'
            message = f'''
                안녕하세요, {user.username}님!

                비밀번호 재설정 요청을 받았습니다.

                아래 링크를 클릭하여 새 비밀번호를 설정해주세요:
                {reset_url}

                이 링크는 1시간 후 만료됩니다.
                만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.

                감사합니다.
                Next.js 팀
            '''
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                
                return Response({
                    'success': True,
                    'message': '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                # 이메일 전송 실패 시 토큰 삭제
                reset_token.delete()
                return Response({
                    'success': False,
                    'error': '이메일 전송에 실패했습니다. 다시 시도해주세요.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': '서버 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        """
        비밀번호 재설정 API
        """
        try:
            data = request.data
            token = data.get('token')
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            if not token or not new_password or not confirm_password:
                return Response({
                    'success': False,
                    'error': '토큰과 새 비밀번호가 필요합니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 비밀번호 일치 검증
            if new_password != confirm_password:
                return Response({
                    'success': False,
                    'error': '비밀번호가 일치하지 않습니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 토큰 검증
            reset_token = PasswordResetToken.objects.filter(
                token=token,
                is_used=False
            ).first()
            
            if not reset_token:
                return Response({
                    'success': False,
                    'error': '유효하지 않은 토큰입니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if reset_token.is_expired():
                reset_token.delete()
                return Response({
                    'success': False,
                    'error': '토큰이 만료되었습니다. 다시 요청해주세요.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 사용자 찾기
            user = User.objects.filter(email=reset_token.email).first()
            if not user:
                return Response({
                    'success': False,
                    'error': '사용자를 찾을 수 없습니다.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # 비밀번호 업데이트
            user.set_password(new_password)
            user.save()
            
            # 토큰 사용 처리
            reset_token.is_used = True
            reset_token.save()
            
            return Response({
                'success': True,
                'message': '비밀번호가 성공적으로 변경되었습니다.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': '서버 오류가 발생했습니다.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
