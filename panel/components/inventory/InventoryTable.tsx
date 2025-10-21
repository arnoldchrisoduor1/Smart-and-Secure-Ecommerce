'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Edit3, AlertTriangle, XCircle, Package } from 'lucide-react'
import { InventoryItem } from '@/types/inventory'

interface InventoryTableProps {
  inventory: InventoryItem[]
  onAdjustStock: (item: InventoryItem) => void
  isLoading?: boolean
}

export default function InventoryTable({ inventory, onAdjustStock, isLoading }: InventoryTableProps) {
  const getStockStatus = (item: InventoryItem) => {
    if (item.isOutOfStock) {
      return { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Out of Stock' }
    }
    if (item.isLowStock) {
      return { color: 'text-amber-600 bg-amber-50', icon: AlertTriangle, label: 'Low Stock' }
    }
    return { color: 'text-green-600 bg-green-50', icon: Package, label: 'In Stock' }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items found</h3>
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock Level</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Available</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Updated</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item, index) => {
              const status = getStockStatus(item)
              const Icon = status.icon
              
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-sm text-gray-600">{item.variantName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{item.warehouseLocation}</p>
                      {item.binLocation && (
                        <p className="text-xs text-gray-500">Bin: {item.binLocation}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.quantity.toLocaleString()} units
                      </p>
                      <p className="text-xs text-gray-500">
                        Reserved: {item.reserved} units
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm font-medium ${
                      item.availableQuantity <= item.lowStockThreshold 
                        ? 'text-amber-600' 
                        : 'text-gray-900'
                    }`}>
                      {item.availableQuantity} units
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <Icon size={12} />
                      {status.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onAdjustStock(item)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit3 size={14} />
                      Adjust
                    </button>
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