'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLayout from '@/components/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'success'

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>('login')
  const [resetToken, setResetToken] = useState<string>('')

  // Extract token from URL (for email verification links)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const mode = urlParams.get('mode')
      
      if (token && mode === 'resetPassword') {
        setResetToken(token)
        setCurrentView('reset-password')
      }
    }
  }, [])

  const getLayoutProps = () => {
    switch (currentView) {
      case 'login':
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to access your personalized shopping experience and track your orders.'
        }
      case 'signup':
        return {
          title: 'Join BeanCart',
          subtitle: 'Create your account to discover amazing products and exclusive deals.'
        }
      case 'forgot-password':
        return {
          title: 'Reset Password',
          subtitle: 'We\'ll help you get back into your account quickly and securely.'
        }
      case 'reset-password':
        return {
          title: 'New Password',
          subtitle: 'Create a strong new password to secure your account.'
        }
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to access your personalized shopping experience.'
        }
    }
  }

  const handleLoginSuccess = () => {
    // Redirect to dashboard or home page
    console.log('Login successful - redirecting...')
    window.location.href = '/'
  }

  const handleSignupSuccess = () => {
    setCurrentView('login')
    // You could also show a verification message here
  }

  const handleResetSent = () => {
    setCurrentView('login')
    // You could show a toast notification here
  }

  return (
    <AuthLayout {...getLayoutProps()}>
      <AnimatePresence mode="wait">
        {currentView === 'login' && (
          <LoginForm
            key="login"
            onSwitchToSignup={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === 'signup' && (
          <SignupForm
            key="signup"
            onSwitchToLogin={() => setCurrentView('login')}
            onSignupSuccess={handleSignupSuccess}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordForm
            key="forgot-password"
            onSwitchToLogin={() => setCurrentView('login')}
            onResetSent={handleResetSent}
          />
        )}

        {currentView === 'reset-password' && (
          <ResetPasswordForm
            key="reset-password"
            onSwitchToLogin={() => setCurrentView('login')}
            token={resetToken}
          />
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}