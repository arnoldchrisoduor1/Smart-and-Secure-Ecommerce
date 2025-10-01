'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '../ButtonComponent'
import Input from '../InputComponent'

interface ResetPasswordFormProps {
  onSwitchToLogin: () => void
  token?: string
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSwitchToLogin, 
  token 
}) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Extract token from URL if provided
  useEffect(() => {
    if (token) {
      console.log('Token extracted:', token)
      // Here you would validate the token with your backend
    }
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Password reset data:', { token, ...formData })
      setIsSuccess(true)
    } catch (error) {
      setErrors({ submit: 'Password reset failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

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
        <Button
          onClick={onSwitchToLogin}
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
    >
      <button
        onClick={onSwitchToLogin}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Back to login
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">New Password</h2>
        <p className="text-gray-600">Create your new password</p>
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

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Reset Password
        </Button>
      </form>
    </motion.div>
  )
}

export default ResetPasswordForm