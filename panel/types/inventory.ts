export interface InventoryItem {
  id: string
  productId: string
  productName: string
  variantName?: string
  quantity: number
  reserved: number
  availableQuantity: number
  lowStockThreshold: number
  isLowStock: boolean
  isOutOfStock: boolean
  warehouseLocation: string
  binLocation?: string
  lastRestockedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface StockAdjustment {
  itemId: string
  quantity: number
  reason?: string
}