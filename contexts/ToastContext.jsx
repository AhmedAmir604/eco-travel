'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const newToast = { id, message, type, duration }

    setToasts(prev => [...prev, newToast])

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const toast = {
    success: useCallback((message, duration) => addToast(message, 'success', duration), [addToast]),
    error: useCallback((message, duration) => addToast(message, 'error', duration), [addToast]),
    warning: useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]),
    info: useCallback((message, duration) => addToast(message, 'info', duration), [addToast]),
  }

  const contextValue = {
    toasts,
    toast,
    removeToast
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}