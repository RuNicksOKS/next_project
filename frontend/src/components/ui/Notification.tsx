'use client'

import { useState, useEffect } from 'react'
import styles from './Notification.module.css'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Notification({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 4000 
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className={`${styles.notification} ${styles[type]} ${isVisible ? styles.show : ''}`}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
        </div>
        <div className={styles.message}>{message}</div>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="알림 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
