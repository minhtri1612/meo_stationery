'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {formatToVND} from "@/lib/utils";
import {Minus, Plus} from "lucide-react";
import {toast} from "sonner";
import Image from "next/image";

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

  const validateQuantities = async () => {
    for (const item of cartItems) {
      const response = await fetch(`/api/products?id=${item.id}`)
      const product = await response.json()
      if (item.quantity > product.quantity) {
        toast.error("Số lượng không hợp lệ", {
          description: `Sản phẩm "${item.name}" vượt quá số lượng trong kho. Vui lòng kiểm tra lại số lượng của sản phẩm!.`,
        })
        return false
      }
    }
    return true
  }
  
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
      <h1 className="text-3xl font-bold mb-5">Giỏ Hàng Của Bạn</h1>
      {cartItems.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Tổng</TableHead>
                <TableHead>Thao tác</TableHead>
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
                    <Button variant="destructive" size="sm" onClick={() => removeItem(item.id)}>Xoá</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-5 text-right">
            <p className="text-xl font-bold">Tổng cộng: {formatToVND(total)}</p>
            <Button
                className="mt-3"
                onClick={async () => {
                  const isValid = await validateQuantities()
                  if (isValid) {
                    window.location.href = '/checkout/shipping'
                  }
                }}
            >
              Tiến hành thanh toán
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl mb-4">Giỏ hàng của bạn đang trống</p>
          <div className="flex justify-center mb-8">
            <Image
                src="/shopping.jpg"
                alt="Order Success"
                width={300}
                height={300}
                className=" object-contain"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                }}
            />
          </div>
          <Link href="/">
            <Button>Tiếp tục mua sắm</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
