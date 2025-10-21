import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Button from '../ButtonComponent'
import Input from '../InputComponent'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void
  onResetSent: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onSwitchToLogin, 
  onResetSent 
}) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  
  const { forgotPassword, isLoading, error: authError, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid')
      return
    }

    try {
      await forgotPassword(email)
      toast.success('Password reset link sent to your email!')
      onResetSent()
    } catch (error) {
      // Error is handled in store and shown via toast from axios interceptor
      console.error('Forgot password error:', error)
    }
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
            if (authError) clearError()
          }}
          error={error || authError || ''}
          leftIcon={<Mail size={20} />}
          placeholder="your@email.com"
        />

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Send Reset Link
        </Button>
      </form>
    </motion.div>
  )
}

export default ForgotPasswordForm