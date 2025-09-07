# Next Project

Next.js 프론트엔드와 Django 백엔드, PostgreSQL 데이터베이스를 사용하는 풀스택 웹 애플리케이션입니다.

## 프로젝트 구조

```
next_project/
├── 📁 backend/                    # Django 백엔드
│   ├── 📁 api/                   # API 앱
│   │   ├── 📁 migrations/        # 데이터베이스 마이그레이션
│   │   ├── 📄 admin.py          # Django 관리자 설정
│   │   ├── 📄 apps.py           # 앱 설정
│   │   ├── 📄 models.py         # 데이터 모델
│   │   ├── 📄 tests.py          # 테스트 파일
│   │   ├── 📄 urls.py           # API URL 라우팅
│   │   └── 📄 views.py          # API 뷰
│   ├── 📁 config/                # Django 프로젝트 설정
│   │   ├── 📄 __init__.py       # Python 패키지 초기화
│   │   ├── 📄 asgi.py           # ASGI 설정
│   │   ├── 📄 settings.py       # Django 설정
│   │   ├── 📄 urls.py           # 메인 URL 라우팅
│   │   └── 📄 wsgi.py           # WSGI 설정
│   ├── 📄 .dockerignore          # Docker 빌드 제외 파일
│   ├── 📄 Dockerfile             # 백엔드 Docker 이미지 설정
│   ├── 📄 entrypoint.sh          # 컨테이너 시작 스크립트
│   ├── 📄 manage.py              # Django 관리 명령어
│   └── 📄 pyproject.toml         # Python 의존성 관리
├── 📁 frontend/                   # Next.js 프론트엔드
│   ├── 📁 public/                # 정적 파일
│   │   ├── 📄 favicon.ico        # 파비콘
│   │   ├── 📄 file.svg           # 파일 아이콘
│   │   ├── 📄 globe.svg          # 글로브 아이콘
│   │   ├── 📄 next.svg           # Next.js 로고
│   │   ├── 📄 vercel.svg         # Vercel 로고
│   │   └── 📄 window.svg         # 윈도우 아이콘
│   ├── 📁 src/                   # 소스 코드
│   │   └── 📁 app/               # Next.js App Router
│   │       ├── 📄 favicon.ico    # 앱 파비콘
│   │       ├── 📄 globals.css    # 전역 스타일
│   │       ├── 📄 layout.tsx     # 루트 레이아웃
│   │       └── 📄 page.tsx       # 홈페이지
│   ├── 📄 .dockerignore          # Docker 빌드 제외 파일
│   ├── 📄 .gitignore             # Git 제외 파일
│   ├── 📄 Dockerfile             # 프론트엔드 Docker 이미지 설정
│   ├── 📄 eslint.config.mjs      # ESLint 설정
│   ├── 📄 next-env.d.ts          # Next.js TypeScript 타입
│   ├── 📄 next.config.ts         # Next.js 설정
│   ├── 📄 package-lock.json      # npm 의존성 잠금 파일
│   ├── 📄 package.json           # Node.js 의존성 및 스크립트
│   ├── 📄 postcss.config.mjs     # PostCSS 설정
│   ├── 📄 README.md              # 프론트엔드 README
│   └── 📄 tsconfig.json          # TypeScript 설정
├── 📄 .dockerignore              # Docker 빌드 제외 파일
├── 📄 .gitignore                 # Git 제외 파일
├── 📄 docker-compose.yml         # Docker Compose 설정
└── 📄 README.md                  # 프로젝트 README (현재 파일)
```

## 기술 스택

### 프론트엔드
- **Next.js 15.5.2** - React 프레임워크
- **React 19.1.0** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS 4** - CSS 프레임워크
- **ESLint** - 코드 품질 관리

### 백엔드
- **Django 5.2.6** - Python 웹 프레임워크
- **Django REST Framework 3.16.1** - API 개발
- **Poetry** - Python 의존성 관리
- **psycopg2-binary** - PostgreSQL 어댑터

### 데이터베이스
- **PostgreSQL 16.2** - 관계형 데이터베이스
- **pgAdmin 8.8** - 데이터베이스 관리 도구

### 인프라
- **Docker & Docker Compose** - 컨테이너화
- **Multi-stage Docker builds** - 최적화된 이미지 빌드

## 빠른 시작

### 사전 요구사항
- Docker & Docker Compose
- Git

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd next_project
   ```

2. **환경 변수 설정**
   ```bash
   # 각 환경 변수 파일이 이미 설정되어 있습니다
   # 필요에 따라 값들을 수정하세요
   ```

3. **Docker Compose로 전체 스택 실행**
   ```bash
   docker-compose up --build
   ```

4. **서비스 접속**
   - **프론트엔드**: http://localhost:3000
   - **백엔드 API**: http://localhost:8000
   - **Django 관리자**: http://localhost:8000/admin
   - **pgAdmin**: http://localhost:5050

## 개발 환경 설정

### 백엔드 개발

1. **백엔드 컨테이너 접속**
   ```bash
   docker-compose exec backend-dev bash
   ```

2. **Django 명령어 실행**
   ```bash
   # 마이그레이션
   python manage.py makemigrations
   python manage.py migrate
   
   # 슈퍼유저 생성
   python manage.py createsuperuser
   
   # 개발 서버 실행
   python manage.py runserver 0.0.0.0:8000
   ```

### 프론트엔드 개발

1. **프론트엔드 컨테이너 접속**
   ```bash
   docker-compose exec frontend-dev bash
   ```

2. **개발 명령어**
   ```bash
   # 의존성 설치
   npm install
   
   # 개발 서버 실행
   npm run dev
   
   # 빌드
   npm run build
   
   # 린트 검사
   npm run lint
   ```

## API 엔드포인트

### 기본 API
- `GET /api/test/hello/` - Hello World API
- `GET /api/test/health/` - 헬스 체크 API

### Django 관리자
- `GET /admin/` - Django 관리자 인터페이스
  - 기본 계정: `admin` / `admin123`

## 데이터베이스 관리

### pgAdmin 접속
- **URL**: http://localhost:5050
- **이메일**: admin@admin.com
- **비밀번호**: admin123

### 데이터베이스 연결 정보
- **호스트**: db-dev
- **포트**: 5432
- **데이터베이스**: next_project_db
- **사용자**: postgres
- **비밀번호**: postgres123

## 환경 변수

### 데이터베이스 (.env.db)
```bash
POSTGRES_DB=next_project_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
```

### pgAdmin (.env.pgadmin)
```bash
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin123
```

### 백엔드 (backend/.env)
```bash
DEBUG=1
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:postgres123@db-dev:5432/next_project_db
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 프론트엔드 (frontend/.env)
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Next Project
```

## Docker 명령어

### 기본 명령어
```bash
# 전체 스택 시작
docker-compose up

# 백그라운드에서 시작
docker-compose up -d

# 특정 서비스만 시작
docker-compose up db-dev

# 전체 스택 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v

# 이미지 재빌드
docker-compose up --build

# 로그 확인
docker-compose logs -f [service-name]
```

### 개발용 명령어
```bash
# 백엔드 컨테이너 접속
docker-compose exec backend-dev bash

# 프론트엔드 컨테이너 접속
docker-compose exec frontend-dev bash

# 데이터베이스 컨테이너 접속
docker-compose exec db-dev psql -U postgres -d next_project_db
```

## 테스트

### 백엔드 테스트
```bash
docker-compose exec backend-dev python manage.py test
```

### 프론트엔드 테스트
```bash
docker-compose exec frontend-dev npm test
```

## 개발 가이드

### 새로운 API 엔드포인트 추가
1. `backend/api/views.py`에 뷰 함수 추가
2. `backend/api/urls.py`에 URL 패턴 추가
3. 필요시 `backend/api/models.py`에 모델 추가
4. 마이그레이션 실행: `python manage.py makemigrations && python manage.py migrate`

### 새로운 페이지 추가
1. `frontend/src/app/` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 생성
3. 필요시 `layout.tsx` 파일 생성

### 스타일링
- Tailwind CSS 클래스 사용
- `frontend/src/app/globals.css`에서 전역 스타일 정의

## 보안 고려사항

- 환경 변수 파일들이 Docker 이미지에 포함되지 않음
- `.env` 파일들이 `.gitignore`에 포함됨
- `.dockerignore`로 민감한 파일 제외
- CORS 설정으로 프론트엔드 도메인만 허용

## 배포

### 프로덕션 환경 변수 설정
1. 각 `.env` 파일의 값들을 프로덕션용으로 변경
2. `SECRET_KEY`를 안전한 값으로 변경
3. `DEBUG=False`로 설정
4. 데이터베이스 연결 정보 업데이트

### Docker 이미지 빌드
```bash
# 프로덕션 이미지 빌드
docker-compose -f docker-compose.prod.yml build
```