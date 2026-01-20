// API 설정
export const API_CONFIG = {
  // 개발 환경에서는 디버깅 서버(8001) 사용
  // Docker 컨테이너 내부에서는 컨테이너 이름으로 접근
  // 호스트에서 접근할 때는 localhost 사용
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' 
      ? 'http://localhost:8000'  // 브라우저에서 접근 (일반 서버)
      : 'http://backend-container-dev:8000'  // 서버사이드에서 접근
    ),
  
  // API 엔드포인트들
  ENDPOINTS: {
    SEND_VERIFICATION_EMAIL: '/test/send_verification_email/',
    VERIFY_EMAIL: '/test/verify_email/',
    SIGNUP: '/test/signup/',
    HELLO: '/test/hello/',
    HEALTH: '/test/health/',
  }
}

// 전체 API URL 생성 함수
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
