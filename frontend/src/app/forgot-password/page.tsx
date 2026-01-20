'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Notification from '../../components/popup/Notification'
import NextAuthLayout from '../../components/mainpage/NextAuthLayout'
import styles from './page.module.css'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    email: '',
    username: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    username: ''
  })

  const [touched, setTouched] = useState({
    email: false,
    username: false
  })

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 입력 시 에러 메시지 제거
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      username: ''
    }

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    // 사용자명 검증
    if (!formData.username) {
      newErrors.username = '사용자명을 입력해주세요.'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isClient) return

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/request_password_reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username
        })
      })

      const data = await response.json()

      if (data.success) {
        setNotification({
          isVisible: true,
          message: data.message,
          type: 'success'
        })
        
        // 성공 시 폼 초기화
        setFormData({
          email: '',
          username: ''
        })
        setTouched({
          email: false,
          username: false
        })
      } else {
        setNotification({
          isVisible: true,
          message: data.error,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('비밀번호 재설정 요청 오류:', error)
      setNotification({
        isVisible: true,
        message: '서버 오류가 발생했습니다. 다시 시도해주세요.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }))
  }

  if (!isClient) {
    return (
      <NextAuthLayout>
        <div className={styles.loading}>로딩 중...</div>
      </NextAuthLayout>
    )
  }

  return (
    <NextAuthLayout>
      <div className={styles.loginForm}>
        {/* Next 로고 */}
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>
            Next.js
          </h1>
        </div>

        <div className={styles.header}>
          <p className={styles.subtitle}>비밀번호를 잊으셨나요?</p>
          <p className={styles.description}>
            계정에 등록된 이메일과 사용자명을 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${styles.inputField} ${errors.email && touched.email ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            {errors.email && touched.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="사용자명"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${styles.inputField} ${errors.username && touched.username ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            {errors.username && touched.username && (
              <span className={styles.errorText}>{errors.username}</span>
            )}
          </div>

          <button
            type="submit"
            className={`${styles.loginButton} ${isLoading ? styles.buttonLoading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '전송 중...' : '비밀번호 재설정 링크 보내기'}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            onClick={() => router.push('/')}
            className={styles.backButton}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>

      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={closeNotification}
        />
      )}
    </NextAuthLayout>
  )
}
