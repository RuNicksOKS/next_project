'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Notification from '../../components/ui/Notification'
import InstagramAuthLayout from '../../components/layouts/InstagramAuthLayout'
import styles from './page.module.css'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false
  })

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true)
    const tokenParam = searchParams.get('token')
    setToken(tokenParam)
    
    if (!tokenParam) {
      setTokenValid(false)
      setNotification({
        isVisible: true,
        message: '유효하지 않은 링크입니다.',
        type: 'error'
      })
    } else {
      setTokenValid(true)
    }
  }, [searchParams])

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
      newPassword: '',
      confirmPassword: ''
    }

    // 새 비밀번호 검증
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isClient || !token) return

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/reset_password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: formData.newPassword,
          confirm_password: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setNotification({
          isVisible: true,
          message: data.message,
          type: 'success'
        })
        
        // 성공 시 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setNotification({
          isVisible: true,
          message: data.error,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error)
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
      <InstagramAuthLayout>
        <div className={styles.loading}>로딩 중...</div>
      </InstagramAuthLayout>
    )
  }

  if (tokenValid === false) {
    return (
      <InstagramAuthLayout>
        <div className={styles.loginForm}>
          {/* Instagram 로고 */}
          <div className={styles.logoContainer}>
            <h1 className={styles.logo}>
              Instagram
            </h1>
          </div>

          <div className={styles.header}>
            <p className={styles.subtitle}>유효하지 않은 링크</p>
            <p className={styles.description}>
              이 링크는 유효하지 않거나 만료되었습니다.<br />
              새로운 비밀번호 재설정 요청을 해주세요.
            </p>
          </div>
          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className={styles.backButton}
            >
              비밀번호 재설정 요청하기
            </button>
          </div>
        </div>
      </InstagramAuthLayout>
    )
  }

  return (
    <InstagramAuthLayout>
      <div className={styles.loginForm}>
        {/* Instagram 로고 */}
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>
            Instagram
          </h1>
        </div>

        <div className={styles.header}>
          <p className={styles.subtitle}>새 비밀번호 설정</p>
          <p className={styles.description}>
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="password"
              name="newPassword"
              placeholder="새 비밀번호"
              value={formData.newPassword}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${styles.inputField} ${errors.newPassword && touched.newPassword ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            {errors.newPassword && touched.newPassword && (
              <span className={styles.errorText}>{errors.newPassword}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              name="confirmPassword"
              placeholder="새 비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`${styles.inputField} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={`${styles.loginButton} ${isLoading ? styles.buttonLoading : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '비밀번호 변경'}
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
    </InstagramAuthLayout>
  )
}
