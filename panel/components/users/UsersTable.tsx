'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, Trash2, Mail, Shield, UserCheck, UserX, Clock, Lock, Users } from 'lucide-react'
import { User, UserRole, UserStatus } from '@/types/user'

interface UsersTableProps {
  users: User[]
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  isLoading?: boolean
}

export default function UsersTable({ users, onEditUser, onDeleteUser, isLoading }: UsersTableProps) {
  const getStatusInfo = (user: User) => {
    switch (user.status) {
      case UserStatus.ACTIVE:
        return { color: 'text-green-600 bg-green-50', icon: UserCheck, label: 'Active' }
      case UserStatus.INACTIVE:
        return { color: 'text-gray-600 bg-gray-50', icon: UserX, label: 'Inactive' }
      case UserStatus.SUSPENDED:
        return { color: 'text-red-600 bg-red-50', icon: Lock, label: 'Suspended' }
      case UserStatus.PENDING_VERIFICATION:
        return { color: 'text-amber-600 bg-amber-50', icon: Clock, label: 'Pending' }
      default:
        return { color: 'text-gray-600 bg-gray-50', icon: UserX, label: 'Unknown' }
    }
  }

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { color: 'text-purple-600 bg-purple-50', icon: Shield, label: 'Admin' }
      case UserRole.USER:
        return { color: 'text-blue-600 bg-blue-50', icon: UserCheck, label: 'User' }
      case UserRole.GUEST:
        return { color: 'text-gray-600 bg-gray-50', icon: UserX, label: 'Guest' }
      default:
        return { color: 'text-gray-600 bg-gray-50', icon: UserX, label: 'Unknown' }
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isLocked = (user: User) => {
    return user.lockedUntil && user.lockedUntil > new Date()
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">MFA</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Login</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Failed Logins</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => {
              const statusInfo = getStatusInfo(user)
              const roleInfo = getRoleInfo(user.role)
              const StatusIcon = statusInfo.icon
              const RoleIcon = roleInfo.icon
              
              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : 'No Name'
                            }
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail size={12} />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {!user.emailVerified && (
                        <p className="text-xs text-amber-600 mt-1">Email not verified</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                      <RoleIcon size={12} />
                      {roleInfo.label}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </div>
                      {isLocked(user) && (
                        <p className="text-xs text-red-600">Locked until {formatDate(user.lockedUntil)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.mfaEnabled 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-600 bg-gray-50'
                    }`}>
                      <Shield size={12} />
                      {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className={`font-medium ${
                        user.failedLoginAttempts > 0 ? 'text-amber-600' : 'text-gray-900'
                      }`}>
                        {user.failedLoginAttempts}
                      </span>
                      {user.failedLoginAttempts > 3 && (
                        <p className="text-xs text-red-600">High risk</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditUser(user)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}