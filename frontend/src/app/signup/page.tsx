'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Notification from '../../components/popup/Notification'
import NextAuthLayout from '../../components/mainpage/NextAuthLayout'
import styles from './page.module.css'

export default function SignupPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    username: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  })

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  })

  const [touched, setTouched] = useState({
    email: false,
    nickname: false,
    username: false,
    password: false,
    confirmPassword: false,
    verificationCode: false
  })

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  })

  const [emailVerified, setEmailVerified] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    // sessionStorage에서 인증된 이메일 확인
    const verifiedEmail = sessionStorage.getItem('verifiedEmail')
    if (verifiedEmail) {
      setFormData(prev => ({
        ...prev,
        email: verifiedEmail
      }))
      setEmailVerified(true)
      setIsVerified(true)
      setIsClient(true)
    } else {
      // 인증되지 않은 상태에서 직접 접근한 경우 메인 페이지로 리다이렉트
      setIsClient(true)
      router.push('/')
    }

    // 페이지 언마운트 시 sessionStorage에서 인증 정보 삭제
    return () => {
      sessionStorage.removeItem('verifiedEmail')
    }
  }, [router])

  // 이메일 형식 검증 함수
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 비밀번호 일치 검증 함수
  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword
  }

  // 모든 필드의 유효성 검사가 통과되었는지 확인하는 함수
  const isFormValid = () => {
    return (
      emailVerified &&
      validateEmail(formData.email) &&
      formData.nickname.trim() !== '' &&
      formData.username.trim() !== '' &&
      formData.password !== '' &&
      formData.confirmPassword !== '' &&
      validatePasswordMatch(formData.password, formData.confirmPassword)
    )
  }

  // 알림 표시 함수
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      isVisible: true,
      message,
      type
    })
  }

  // 알림 닫기 함수
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  // 이메일 인증번호 전송 함수
  const sendVerificationEmail = async () => {
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다' }))
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test/send_verification_email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const result = await response.json()

      if (result.success) {
        setEmailSent(true)
        showNotification('인증번호가 전송되었습니다. 이메일을 확인해주세요.', 'success')
      } else {
        showNotification(result.error || '인증번호 전송에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('이메일 전송 오류:', error)
      showNotification('서버 연결에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setIsSendingEmail(false)
    }
  }

  // 이메일 인증번호 검증 함수
  const verifyEmailCode = async () => {
    if (!formData.verificationCode) {
      setErrors(prev => ({ ...prev, verificationCode: '인증번호를 입력해주세요' }))
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test/verify_email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          verification_code: formData.verificationCode 
        }),
      })

      const result = await response.json()

      if (result.success) {
        setEmailVerified(true)
        showNotification('이메일 인증이 완료되었습니다!', 'success')
      } else {
        setErrors(prev => ({ ...prev, verificationCode: result.error || '인증번호가 올바르지 않습니다' }))
      }
    } catch (error) {
      console.error('이메일 인증 오류:', error)
      showNotification('서버 연결에 실패했습니다. 다시 시도해주세요.', 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 실시간 유효성 검사
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: '올바른 이메일 형식이 아닙니다' }))
      } else {
        setErrors(prev => ({ ...prev, email: '' }))
      }
      // 이메일이 변경되면 인증 상태 초기화
      if (value !== formData.email) {
        setEmailVerified(false)
        setEmailSent(false)
      }
    }

    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : formData.password
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword
      
      if (password && confirmPassword && !validatePasswordMatch(password, confirmPassword)) {
        setErrors(prev => ({ 
          ...prev, 
          password: '비밀번호가 일치하지 않습니다',
          confirmPassword: '비밀번호가 일치하지 않습니다'
        }))
      } else {
        setErrors(prev => ({ 
          ...prev, 
          password: '',
          confirmPassword: ''
        }))
      }
    }

    if (name === 'verificationCode') {
      if (value && value.length !== 6) {
        setErrors(prev => ({ ...prev, verificationCode: '인증번호는 6자리입니다' }))
      } else {
        setErrors(prev => ({ ...prev, verificationCode: '' }))
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 모든 필드를 touched로 설정
    setTouched({
      email: true,
      nickname: true,
      username: true,
      password: true,
      confirmPassword: true,
      verificationCode: true
    })

    // 이메일 인증 확인
    if (!emailVerified) {
      showNotification('이메일 인증을 완료해주세요.', 'error')
      return
    }

    // 최종 유효성 검사
    let hasErrors = false
    const newErrors = { email: '', password: '', confirmPassword: '', verificationCode: '' }

    if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다'
      hasErrors = true
    }

    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      newErrors.password = '비밀번호가 일치하지 않습니다'
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
      hasErrors = true
    }

    setErrors(newErrors)

    if (hasErrors) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/test/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        showNotification('회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.', 'success')
        
        // 2초 후 로그인 화면으로 리다이렉트
        setTimeout(() => {
          router.push('/')
        }, 2000)
        
        // 폼 초기화
        setFormData({
          email: '',
          nickname: '',
          username: '',
          password: '',
          confirmPassword: '',
          verificationCode: ''
        })
        setTouched({
          email: false,
          nickname: false,
          username: false,
          password: false,
          confirmPassword: false,
          verificationCode: false
        })
        setErrors({ email: '', password: '', confirmPassword: '', verificationCode: '' })
        setEmailVerified(false)
        setEmailSent(false)
      } else {
        // 서버에서 오류 응답
        if (result.field === 'email' && result.error === '이미 존재하는 이메일입니다.') {
          setErrors({ email: '이미 존재하는 이메일입니다', password: '', confirmPassword: '', verificationCode: '' })
          setTouched(prev => ({ ...prev, email: true }))
        } else {
          showNotification(result.error || '회원가입 중 오류가 발생했습니다.', 'error')
        }
      }
    } catch (error) {
      console.error('회원가입 오류:', error)
      showNotification('서버 연결에 실패했습니다. 다시 시도해주세요.', 'error')
    }
  }

  if (!isClient || !isVerified) {
    return null
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
          <p className={styles.subtitle}>친구들의 사진과 동영상을 보려면 가입하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            {/* 인증된 이메일 표시 */}
            {emailVerified && (
              <div className={styles.verifiedEmailDisplay}>
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  value={formData.email}
                  disabled={true}
                  className={`${styles.inputField} ${styles.verifiedEmail}`}
                />
                <span className={styles.verifiedBadge}>✓ 인증됨</span>
              </div>
            )}
            {!emailVerified && (
              <div className={styles.emailInputContainer}>
                <input
                  type="email"
                  name="email"
                  placeholder="이메일"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`${styles.inputField} ${errors.email && touched.email ? styles.inputError : ''} ${validateEmail(formData.email) && touched.email && !errors.email ? styles.inputSuccess : ''}`}
                />
                <button
                  type="button"
                  onClick={sendVerificationEmail}
                  disabled={isSendingEmail || !validateEmail(formData.email)}
                  className={styles.emailVerifyButton}
                >
                  {isSendingEmail ? '전송 중...' : '인증'}
                </button>
              </div>
            )}
            {errors.email && touched.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`${styles.inputField} ${formData.nickname.trim() !== '' && touched.nickname ? styles.inputSuccess : ''}`}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="username"
              placeholder="사용자 이름"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`${styles.inputField} ${formData.username.trim() !== '' && touched.username ? styles.inputSuccess : ''}`}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`${styles.inputField} ${errors.password && touched.password ? styles.inputError : ''} ${formData.password !== '' && touched.password && !errors.password ? styles.inputSuccess : ''}`}
            />
            {errors.password && touched.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호 확인"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`${styles.inputField} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ''} ${formData.confirmPassword !== '' && touched.confirmPassword && validatePasswordMatch(formData.password, formData.confirmPassword) ? styles.inputSuccess : ''}`}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          {/* 이메일 인증번호 입력 섹션 */}
          {emailSent && !emailVerified && (
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="verificationCode"
                placeholder="인증번호 6자리 (숫자, 알파벳)"
                value={formData.verificationCode}
                onChange={(e) => {
                  handleInputChange({
                    target: {
                      name: 'verificationCode',
                      value: e.target.value.toUpperCase()
                    }
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                onBlur={handleBlur}
                maxLength={6}
                className={`${styles.inputField} ${errors.verificationCode && touched.verificationCode ? styles.inputError : ''} ${formData.verificationCode.length === 6 && touched.verificationCode && !errors.verificationCode ? styles.inputSuccess : ''}`}
              />
              <button
                type="button"
                onClick={verifyEmailCode}
                className={styles.verifyButton}
              >
                인증 확인
              </button>
              {errors.verificationCode && touched.verificationCode && (
                <span className={styles.errorText}>{errors.verificationCode}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className={`${styles.loginButton} ${!isFormValid() ? styles.buttonDisabled : ''}`}
            disabled={!isFormValid()}
          >
            가입하기
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
          onClose={hideNotification}
        />
      )}
    </NextAuthLayout>
  )
}
