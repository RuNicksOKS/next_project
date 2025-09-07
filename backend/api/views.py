from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse

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