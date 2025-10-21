'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '../ButtonComponent'
import Input from '../InputComponent'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'

interface ResetPasswordFormProps {
  onSwitchToLogin?: () => void
  token?: string
  standalone?: boolean
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSwitchToLogin, 
  token: propToken,
  standalone = false
}) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [actualToken, setActualToken] = useState(propToken || '')
  
  const { resetPassword, isLoading, error: authError, clearError } = useAuthStore()
  const router = useRouter()

  // Extract token from URL if not provided as prop
  useEffect(() => {
    if (typeof window !== 'undefined' && !propToken) {
      const urlParams = new URLSearchParams(window.location.search)
      const urlToken = urlParams.get('token')
      if (urlToken) {
        setActualToken(urlToken)
        console.log('Token extracted from URL:', urlToken)
      }
    }
  }, [propToken])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (authError) {
      clearError()
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!actualToken) {
      newErrors.submit = 'Invalid or missing reset token. Please request a new reset link.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await resetPassword({
        token: actualToken,
        newPassword: formData.newPassword
      })
      
      toast.success('Password reset successfully! You can now login with your new password.')
      setIsSuccess(true)
      
      // Auto-redirect after success
      setTimeout(() => {
        if (standalone) {
          router.push('/auth')
        } else if (onSwitchToLogin) {
          onSwitchToLogin()
        }
      }, 3000)
    } catch (err: any) {
      console.error('Reset password error:', err)
      // Specific error handling for token issues
      const response = err?.response
      const message = response?.data?.message
      if ((typeof message === 'string' && message.includes('token')) || response?.status === 400) {
        setErrors({ submit: 'Invalid or expired reset token. Please request a new password reset link.' })
      }
    }
  }

  const handleBackToLogin = () => {
    if (standalone) {
      router.push('/auth')
    } else if (onSwitchToLogin) {
      onSwitchToLogin()
    }
  }

  useEffect(() => {
  const validateToken = async () => {
    if (actualToken) {
      try {
        const { valid } = await authApi.validateResetToken(actualToken);
        if (!valid) {
          setErrors({ submit: 'Invalid or expired reset token. Please request a new password reset link.' });
        }
      } catch (error) {
        setErrors({ submit: 'Failed to validate reset token. Please try again.' });
      }
    }
  };

  validateToken();
}, [actualToken]);

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
        <p className="text-gray-600 mb-6">
          Your password has been successfully reset.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Redirecting to login page...
        </p>
        <Button
          onClick={handleBackToLogin}
          className="w-full"
        >
          Back to Login
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={standalone ? "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10" : ""}
    >
      {!standalone && (
        <button
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to login
        </button>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">New Password</h2>
        <p className="text-gray-600">Create your new password</p>
        {!actualToken && (
          <p className="text-red-600 text-sm mt-2">
            No reset token found. Please use the link from your email.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="password"
          name="newPassword"
          label="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          leftIcon={<Lock size={20} />}
          placeholder="••••••••"
          helperText="Must be at least 6 characters"
        />

        <Input
          type="password"
          name="confirmPassword"
          label="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock size={20} />}
          placeholder="••••••••"
        />

        {errors.submit && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm text-center"
          >
            {errors.submit}
          </motion.p>
        )}

        {authError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm text-center"
          >
            {authError}
          </motion.p>
        )}

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
          disabled={!actualToken}
        >
          Reset Password
        </Button>
      </form>

      {standalone && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <button
              onClick={handleBackToLogin}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default ResetPasswordForm