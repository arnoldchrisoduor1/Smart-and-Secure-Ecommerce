'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Package } from 'lucide-react'
import { InventoryItem } from '@/types/inventory'

interface AdjustStockModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem | null
  onAdjust: (itemId: string, quantity: number, reason: string) => void
  isLoading?: boolean
}

export default function AdjustStockModal({ 
  isOpen, 
  onClose, 
  item, 
  onAdjust, 
  isLoading 
}: AdjustStockModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')

  if (!item) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalQuantity = adjustmentType === 'add' ? quantity : -quantity
    onAdjust(item.id, finalQuantity, reason)
    // Reset form
    setQuantity(1)
    setReason('')
    setAdjustmentType('add')
  }

  const maxRemove = item.quantity

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Adjust Stock</h2>
                  <p className="text-sm text-gray-600">{item.productName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Stock Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Current Stock</p>
                  <p className="font-medium text-gray-900">{item.quantity} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Available</p>
                  <p className="font-medium text-gray-900">{item.availableQuantity} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Reserved</p>
                  <p className="font-medium text-gray-900">{item.reserved} units</p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{item.warehouseLocation}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      adjustmentType === 'add'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Plus size={16} />
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('remove')}
                    disabled={item.quantity === 0}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      adjustmentType === 'remove'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50'
                    }`}
                  >
                    <Minus size={16} />
                    Remove Stock
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={adjustmentType === 'remove' ? maxRemove : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                {adjustmentType === 'remove' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {maxRemove} units
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Restocked from supplier, Damaged goods, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Preview */}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  New stock will be:{' '}
                  <span className="font-medium">
                    {item.quantity + (adjustmentType === 'add' ? quantity : -quantity)} units
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (adjustmentType === 'remove' && quantity > maxRemove)}
                  className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}