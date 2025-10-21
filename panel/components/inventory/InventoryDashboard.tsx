'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

import InventoryTable from './InventoryTable';
import InventoryStats from './InventoryStats';
import LowStockAlerts from './LowStockAlerts';
import AdjustStockModal from './AdjustStockModal';
import { InventoryItem } from '@/types/inventory';

// Mock data - replace with actual API calls
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Arabica Coffee Beans',
    variantName: '1kg Bag',
    quantity: 45,
    reserved: 5,
    availableQuantity: 40,
    lowStockThreshold: 10,
    isLowStock: false,
    isOutOfStock: false,
    warehouseLocation: 'Main Warehouse',
    binLocation: 'A1-02',
    lastRestockedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Robusta Coffee Beans',
    variantName: '500g Bag',
    quantity: 8,
    reserved: 2,
    availableQuantity: 6,
    lowStockThreshold: 10,
    isLowStock: true,
    isOutOfStock: false,
    warehouseLocation: 'Main Warehouse',
    binLocation: 'A1-03',
    lastRestockedAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Espresso Cups',
    variantName: 'Set of 6',
    quantity: 0,
    reserved: 0,
    availableQuantity: 0,
    lowStockThreshold: 5,
    isLowStock: true,
    isOutOfStock: true,
    warehouseLocation: 'Main Warehouse',
    binLocation: 'B2-01',
    lastRestockedAt: new Date('2023-12-20'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-22')
  }
]

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all')
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter inventory based on search and filter
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.variantName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'low-stock' ? item.isLowStock :
      filter === 'out-of-stock' ? item.isOutOfStock : true
    
    return matchesSearch && matchesFilter
  })

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsAdjustModalOpen(true)
  }

  const handleStockAdjustment = async (itemId: string, quantity: number, reason: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      console.log('Adjusting stock:', { itemId, quantity, reason })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: Math.max(0, item.quantity + quantity),
              availableQuantity: Math.max(0, item.availableQuantity + quantity),
              isLowStock: (item.quantity + quantity) <= item.lowStockThreshold,
              isOutOfStock: (item.quantity + quantity) === 0,
              updatedAt: new Date()
            }
          : item
      ))
      
      setIsAdjustModalOpen(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Failed to adjust stock:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage stock levels, track inventory, and handle restocking</p>
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
          
          <button className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            <Download size={16} />
            Export
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <InventoryStats inventory={inventory} />

      {/* Low Stock Alerts */}
      <LowStockAlerts inventory={inventory} />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex gap-3 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All Items' },
                { key: 'low-stock', label: 'Low Stock' },
                { key: 'out-of-stock', label: 'Out of Stock' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === key
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <InventoryTable 
          inventory={filteredInventory}
          onAdjustStock={handleAdjustStock}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Adjust Stock Modal */}
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
        onAdjust={handleStockAdjustment}
        isLoading={isLoading}
      />
    </div>
  )
}