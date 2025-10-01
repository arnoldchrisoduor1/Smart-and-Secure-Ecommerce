'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { motion } from 'framer-motion'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string
  label?: string
  error?: string
  helperText?: string
  className?: string
  containerClassName?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  type = 'text',
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  
  const baseStyles = 'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white/80 backdrop-blur-sm'
  const normalStyles = 'border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500/30 text-indigo-900 placeholder-indigo-400'
  const errorStyles = 'border-red-400 focus:border-red-500 focus:ring-red-500/30 text-red-900 placeholder-red-400'
  const disabledStyles = 'bg-indigo-100 cursor-not-allowed text-indigo-400'
  
  return (
    <motion.div 
      className={`w-full ${containerClassName}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="block text-sm font-medium text-indigo-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            ${baseStyles}
            ${error ? errorStyles : normalStyles}
            ${props.disabled ? disabledStyles : 'hover:border-indigo-300'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword ? 'pr-10' : ''}
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </motion.button>
        )}
        
        {!isPassword && rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p 
          className="mt-2 text-sm text-red-600 flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-indigo-600">{helperText}</p>
      )}
    </motion.div>
  )
})

Input.displayName = 'Input'

export default Input