'use client'

import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {formatToVND} from "@/lib/utils";
import {use, useState, useEffect} from "react";
import {useCart} from "@/hooks/useCart";
import { toast } from "sonner"
import {Minus, Plus} from "lucide-react";

const ProductPage = (props: { params: Promise<{ id: string }> }) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = use(props.params)
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      stock: product.quantity
    })

    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name} added to your cart`,
    })
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${params.id}`)
        const data = await response.json()
        if (!data) notFound()
        setProduct(data)
      } catch (error) {
        console.error(error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])


  if (loading) return <div>Loading...</div>
  if (!product) return notFound()

  return (
      <>
        <Breadcrumb className="mb-4 pt-16">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <img
                src={"/placeholder.svg"}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{formatToVND(product.price)}</p>
            <p className="text-gray-700 mb-6">{product.description}</p>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Available Quantity:</span>
                <span>{product.quantity}</span>
              </div>
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-semibold">Order Quantity:</label>
                <div className="inline-flex items-center border rounded-md shadow-sm">
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                      type="text"
                      value={quantity}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (!isNaN(value) && value >= 1 && value <= product.quantity) {
                          setQuantity(value)
                        }
                      }}
                      className="w-12 text-center focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      inputMode="numeric"
                      pattern="[0-9]*"
                  />
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      disabled={quantity >= product.quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
                size="lg"
                disabled={product.quantity === 0}
                onClick={handleAddToCart}
            >
              {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </>
  )
}

export default ProductPage