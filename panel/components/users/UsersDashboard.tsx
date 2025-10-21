'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react'
import UsersTable from './UsersTable'
import UsersStats from './UserStats'
import UserModal from './UserModal'
import { User, UserRole, UserStatus } from '@/types/user'

// Mock data - replace with actual API calls
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@beancart.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    mfaEnabled: true,
    lastLoginAt: new Date('2024-01-20T10:30:00'),
    lastLoginIp: '192.168.1.100',
    failedLoginAttempts: 0,
    deviceFingerprints: ['fp1', 'fp2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date('2024-01-19T15:45:00'),
    lastLoginIp: '192.168.1.101',
    failedLoginAttempts: 2,
    deviceFingerprints: ['fp3'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '3',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.USER,
    status: UserStatus.PENDING_VERIFICATION,
    emailVerified: false,
    mfaEnabled: false,
    lastLoginAt: undefined,
    lastLoginIp: undefined,
    failedLoginAttempts: 0,
    deviceFingerprints: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '4',
    email: 'bob.wilson@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: UserRole.USER,
    status: UserStatus.SUSPENDED,
    emailVerified: true,
    mfaEnabled: true,
    lastLoginAt: new Date('2024-01-15T09:20:00'),
    lastLoginIp: '192.168.1.102',
    failedLoginAttempts: 5,
    lockedUntil: new Date('2024-01-22T09:20:00'),
    deviceFingerprints: ['fp4'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-17')
  }
]

export default function UsersDashboard() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsUserModalOpen(true)
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsUserModalOpen(true)
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log('Saving user:', userData)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (selectedUser) {
        // Update existing user
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...userData, updatedAt: new Date() }
            : user
        ))
      } else {
        // Create new user
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: userData.email!,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: userData.role || UserRole.USER,
          status: userData.status || UserStatus.PENDING_VERIFICATION,
          emailVerified: false,
          mfaEnabled: false,
          failedLoginAttempts: 0,
          deviceFingerprints: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...userData
        }
        setUsers(prev => [...prev, newUser])
      }
      
      setIsUserModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log('Deleting user:', userId)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Data refreshed')
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button 
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <UsersStats users={users} />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.USER}>User</option>
              <option value={UserRole.GUEST}>Guest</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.INACTIVE}>Inactive</option>
              <option value={UserStatus.SUSPENDED}>Suspended</option>
              <option value={UserStatus.PENDING_VERIFICATION}>Pending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <UsersTable 
          users={filteredUsers}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          isLoading={isLoading}
        />
      </motion.div>

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={isLoading}
      />
    </div>
  )
}