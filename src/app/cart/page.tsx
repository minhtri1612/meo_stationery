'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {formatToVND} from "@/lib/utils";
import {Minus, Plus} from "lucide-react";

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  stock: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  const updateQuantity = (id: number, newQuantity: number) => {
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Your Shopping Cart</h1>
      {cartItems.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatToVND(item.price)}</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center border rounded-md">
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value)
                            if (!isNaN(value) && value >= 1 && value <= item.stock) {
                              updateQuantity(item.id, value)
                            }
                          }}
                          className="w-12 text-center focus:outline-none"
                          inputMode="numeric"
                          pattern="[0-9]*"
                      />
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                          disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{formatToVND(item.price * item.quantity)}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-5 text-right">
            <p className="text-xl font-bold">Total: {formatToVND(total)}</p>
            <Link href="/checkout/shipping">
              <Button className="mt-3">Proceed to Checkout</Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link href="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
