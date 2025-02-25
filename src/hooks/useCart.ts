import { useState, useEffect } from 'react'

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  stock: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      setItems(JSON.parse(storedCart))
    }
  }, [])

  const addItem = (item: CartItem) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((i: CartItem) => i.id === item.id)
  
    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      cart.push(item)
    }
  
    localStorage.setItem('cart', JSON.stringify(cart))
    triggerCartUpdate()
  }
  const removeItem = (id: number) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== id)
      localStorage.setItem('cart', JSON.stringify(newItems))
      return newItems
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    setItems(currentItems => {
      const newItems = currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      localStorage.setItem('cart', JSON.stringify(newItems))
      return newItems
    })
    triggerCartUpdate()
  }

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
  }
}
const triggerCartUpdate = () => {
  window.dispatchEvent(new Event('cartUpdated'))
}

