'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react'
import { InventoryItem } from '@/types/inventory'

interface InventoryStatsProps {
  inventory: InventoryItem[]
}

export default function InventoryStats({ inventory }: InventoryStatsProps) {
  const stats = {
    totalItems: inventory.length,
    totalStock: inventory.reduce((sum, item) => sum + item.quantity, 0),
    lowStockItems: inventory.filter(item => item.isLowStock && !item.isOutOfStock).length,
    outOfStockItems: inventory.filter(item => item.isOutOfStock).length,
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalItems,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      description: 'Active inventory items'
    },
    {
      title: 'Total Stock',
      value: stats.totalStock.toLocaleString(),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      description: 'Units in inventory'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'from-orange-500 to-amber-500',
      description: 'Need restocking'
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockItems,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      description: 'Urgent attention needed'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}