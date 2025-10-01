'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Shield, Truck } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const features = [
    {
      icon: ShoppingBag,
      title: 'Wide Selection',
      description: 'Thousands of premium products'
    },
    {
      icon: Star,
      title: 'Best Quality',
      description: 'Curated from trusted suppliers'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your data is always protected'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Brand & Features */}
        <motion.div 
          className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-12 flex-col justify-between"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.div 
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-lg rotate-45"></div>
              </div>
              <span className="text-2xl font-bold">BeanCart</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              <p className="text-indigo-100 text-lg">{subtitle}</p>
            </motion.div>
          </div>

          <motion.div 
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <feature.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-indigo-200 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout