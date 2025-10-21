'use client'

import React from 'react'
import { Trash2, Plus, Minus } from 'lucide-react'

interface CartItemProps {
  productName: string
  price: number
  quantity: number
  imageUrl: string
  totalPrice: number
  itemId: string
  onDeleteItem: (itemId: string) => void
  onIncreaseQuantity: (itemId: string) => void
  onDecreaseQuantity: (itemId: string) => void
}

const CartItem: React.FC<CartItemProps> = ({
  productName,
  price,
  quantity,
  imageUrl,
  totalPrice,
  itemId,
  onDeleteItem,
  onIncreaseQuantity,
  onDecreaseQuantity
}) => {
  
  const handleDeleteClick = (): void => {
    console.log("Sending the delete quantity event to cart parent")
    onDeleteItem(itemId)
  }

  const handleIncreaseQuantity = (): void => {
    console.log("Sending the increase quantity event to cart parent")
    onIncreaseQuantity(itemId)
  }

  const handleDecreaseQuantity = (): void => {
    console.log("Sending the decrease quantity event to cart parent")
    if (quantity > 1) {
      onDecreaseQuantity(itemId)
    }
  }

  return (
    <div className="bg-white/50 p-4 rounded-lg hover:shadow-md hover:cursor-pointer transition-shadow relative shadow-md shadow-indigo-400/70 border border-indigo-200 mt-5">
      {/* Header row with title and timestamp */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          Featured
        </span>
      </div>
      
      {/* Package icon or logo and description */}
      <div className="flex gap-3 mb-3 items-center">
        <div className="flex-shrink-0 border-2 rounded-full">
          <img 
            src={imageUrl} 
            className="h-12 w-12 rounded-full object-cover" 
            alt={productName}
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{productName}</h3>
          <p className="text-sm text-gray-600">${price.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Footer with status and actions */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 justify-between">
          <button 
            onClick={handleDecreaseQuantity}
            disabled={quantity <= 1}
            className={`flex items-center justify-center w-6 h-6 rounded-full hover-animation cursor-pointer ${
              quantity <= 1 
                ? 'bg-gray-400/50 cursor-not-allowed' 
                : 'bg-red-400/50 hover:bg-red-400/70'
            }`}
          >
            <Minus 
              size={12} 
              className={quantity <= 1 ? 'text-gray-600' : 'text-red-600'}
            />
          </button>
          <div>
            <p className="text-xl font-medium">{quantity}</p>
          </div>
          <button 
            onClick={handleIncreaseQuantity}
            className="flex items-center justify-center w-6 h-6 bg-indigo-400/50 rounded-full hover-animation cursor-pointer hover:bg-indigo-400/70"
          >
            <Plus 
              size={12} 
              className="text-indigo-600"
            />
          </button>
        </div>
        
        <div>
          <p className="text-lg font-semibold">$ {totalPrice.toFixed(2)}</p>
        </div>
        
        {/* Delete button */}
        <button 
          onClick={handleDeleteClick}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
        >
          <span className="flex items-center justify-center w-8 h-8 bg-red-400/50 rounded-full hover-animation hover:bg-red-400/70">
            <Trash2
              size={16}
              className="text-red-600"
            />
          </span>
        </button>
      </div>
    </div>
  )
}

export default CartItem