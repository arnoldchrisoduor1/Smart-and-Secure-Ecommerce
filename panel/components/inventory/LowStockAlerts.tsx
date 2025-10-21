'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, XCircle, ArrowRight } from 'lucide-react'
import { InventoryItem } from '@/types/inventory'

interface LowStockAlertsProps {
  inventory: InventoryItem[]
}

export default function LowStockAlerts({ inventory }: LowStockAlertsProps) {
  const lowStockItems = inventory.filter(item => item.isLowStock && !item.isOutOfStock)
  const outOfStockItems = inventory.filter(item => item.isOutOfStock)

  if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Out of Stock Alerts */}
      <AnimatePresence>
        {outOfStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900">
                Out of Stock Items ({outOfStockItems.length})
              </h3>
            </div>
            <div className="space-y-2">
              {outOfStockItems.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-600">{item.variantName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="text-sm font-medium">Out of Stock</span>
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low Stock Alerts */}
      <AnimatePresence>
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">
                Low Stock Alerts ({lowStockItems.length})
              </h3>
            </div>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-sm text-gray-600">{item.variantName}</p>
                    )}
                    <p className="text-sm text-amber-600">
                      Only {item.availableQuantity} units left (threshold: {item.lowStockThreshold})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="text-sm font-medium">Low Stock</span>
                    <ArrowRight size={16} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}