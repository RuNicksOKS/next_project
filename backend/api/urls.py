from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'test', views.TestViewSet, basename='test')

urlpatterns = [
    path('', include(router.urls)),
]
