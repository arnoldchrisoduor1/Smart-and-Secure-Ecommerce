'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Button from '../ButtonComponent'
import Input from '../InputComponent'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSwitchToForgotPassword: () => void
  onLoginSuccess: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToSignup, 
  onSwitchToForgotPassword,
  onLoginSuccess 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
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
      console.log('Login data:', formData)
      onLoginSuccess()
    } catch (error) {
      setErrors({ submit: 'Login failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your BeanCart account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={20} />}
          placeholder="your@email.com"
        />

        <Input
          type="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
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

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  )
}

export default LoginForm