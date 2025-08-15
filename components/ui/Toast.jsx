'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    const baseStyles = "fixed top-20 right-4 z-50 max-w-xs w-auto min-w-[280px] rounded-xl shadow-lg backdrop-blur-sm p-3 transform transition-all duration-300 ease-in-out"

    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`
    }

    const typeStyles = {
      success: 'bg-emerald-50/90 border border-emerald-200/50 text-emerald-800',
      error: 'bg-red-50/90 border border-red-200/50 text-red-800',
      warning: 'bg-amber-50/90 border border-amber-200/50 text-amber-800',
      info: 'bg-sky-50/90 border border-sky-200/50 text-sky-800'
    }

    return `${baseStyles} translate-x-0 opacity-100 scale-100 ${typeStyles[type]}`
  }

  const getIcon = () => {
    const iconProps = { size: 16, className: "flex-shrink-0" }

    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className="text-emerald-600 flex-shrink-0" />
      case 'error':
        return <AlertCircle {...iconProps} className="text-red-600 flex-shrink-0" />
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-amber-600 flex-shrink-0" />
      case 'info':
      default:
        return <Info {...iconProps} className="text-sky-600 flex-shrink-0" />
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <p className="text-sm font-medium flex-1 leading-relaxed">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-current/60 hover:text-current transition-colors rounded-full p-0.5 hover:bg-current/10"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default Toast