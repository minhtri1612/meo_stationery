'use client'

import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {formatToVND} from "@/lib/utils";
import {use, useState, useEffect, useRef} from "react";
import {useCart} from "@/hooks/useCart";
import { toast } from "sonner"
import {ChevronLeft, ChevronRight, Minus, Plus} from "lucide-react";

const ProductPage = (props: { params: Promise<{ id: string }> }) => {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productImages, setProductImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const params = use(props.params)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      stock: product.quantity
    })

    toast.success("Đã thêm vào giỏ hàng!", {
      description: `${quantity} ${product.name} đã được thêm vào giỏ hàng của bạn.`,
    })
  }
  
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)
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

  useEffect(() => {
    const loadProductImages = async () => {
      const images = []
      for(let i = 0; i < 10; i++) {
        const imagePath = `/products/${params.id}/${i}.jpg`
        try {
          const response = await fetch(imagePath, { method: 'HEAD' })
          if (response.ok) {
            images.push(imagePath)
          }
        } catch (error) {
          break
        }
      }
      setProductImages(images)
    }

    loadProductImages()
  }, [params.id])

  useEffect(() => {
    if (thumbnailsRef.current) {
      const selectedThumb = thumbnailsRef.current.children[selectedImage] as HTMLElement
      if (selectedThumb) {
        selectedThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [selectedImage])
  
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
            <div className="relative mb-4">
              <img
                  src={productImages[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-[600px] h-[600px] object-cover rounded-lg"
              />
              <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
                  aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all"
                  aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div className="relative">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div ref={thumbnailsRef} className="inline-flex space-x-2 p-2">
                  {productImages.map((image, index) => (
                      <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 border rounded-md overflow-hidden ${
                              selectedImage === index ? "border-primary border-2" : "border-gray-200"
                          }`}
                      >
                        <img
                            src={image || "/placeholder.svg"}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-[150px] h-[150px] object-cover"
                        />
                      </button>
                  ))}
                </div>
              </div>
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-white to-transparent w-8 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-white to-transparent w-8 pointer-events-none" />
            </div>
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{formatToVND(product.price)}</p>
            <p className="text-gray-700 mb-6">{product.description}</p>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Số lượng có sẵn:</span>
                <span>{product.quantity}</span>
              </div>
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-semibold">Số lượng đặt:</label>
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
              {product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </Button>
          </div>
        </div>
      </>
  )
}

export default ProductPage