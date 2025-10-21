'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, UserCheck, UserX, Shield, Clock } from 'lucide-react'
import { User, UserRole, UserStatus } from '@/types/user'

interface UsersStatsProps {
  users: User[]
}

export default function UsersStats({ users }: UsersStatsProps) {
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === UserStatus.ACTIVE).length,
    adminUsers: users.filter(user => user.role === UserRole.ADMIN).length,
    pendingUsers: users.filter(user => user.status === UserStatus.PENDING_VERIFICATION).length,
    suspendedUsers: users.filter(user => user.status === UserStatus.SUSPENDED).length,
    mfaEnabled: users.filter(user => user.mfaEnabled).length,
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      description: 'All registered users'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'from-green-500 to-emerald-500',
      description: 'Currently active'
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: Shield,
      color: 'from-purple-500 to-violet-500',
      description: 'Administrator accounts'
    },
    {
      title: 'Pending Verification',
      value: stats.pendingUsers,
      icon: Clock,
      color: 'from-orange-500 to-amber-500',
      description: 'Awaiting email verification'
    },
    {
      title: 'Suspended',
      value: stats.suspendedUsers,
      icon: UserX,
      color: 'from-red-500 to-rose-500',
      description: 'Temporarily suspended'
    },
    {
      title: 'MFA Enabled',
      value: stats.mfaEnabled,
      icon: Shield,
      color: 'from-indigo-500 to-blue-500',
      description: 'Using two-factor auth'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 truncate">{stat.description}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} flex-shrink-0 ml-2`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}