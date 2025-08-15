'use client'

import { useEffect, useState } from 'react'
import Toast from './ui/Toast'
import { useToast } from '@/hooks/useToast'

const ToastContainer = () => {
  const [mounted, setMounted] = useState(false)
  const { toasts, removeToast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 50 - index 
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer