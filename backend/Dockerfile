# Python 3.12.2 slim 이미지 사용
FROM python:3.12.2-slim as development

# 작업 디렉토리 설정
WORKDIR /usr/workspace

# 파이썬 바이트코드 파일 생성 방지
ENV PYTHONDONTWRITEBYTECODE=1
# 파이썬 출력 버퍼링 비활성화
ENV PYTHONUNBUFFERED=1

# 필요한 패키지 설치
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3-dev \
        gcc \
        musl-dev \
        libffi-dev \
        netcat-openbsd \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Poetry 설치 및 의존성 설치
COPY pyproject.toml ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only=main

# 모든 소스 파일을 컨테이너로 복사
COPY . .

# Django 마이그레이션 및 서버 실행을 위한 스크립트
COPY entrypoint.sh /usr/workspace/entrypoint.sh
RUN chmod +x /usr/workspace/entrypoint.sh

# 컨테이너 시작 시 entrypoint.sh 실행
ENTRYPOINT ["/usr/workspace/entrypoint.sh"]
