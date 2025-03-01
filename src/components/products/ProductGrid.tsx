'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from "@/hooks/useCart"
import { Skeleton } from "@/components/ui/skeleton"
import {formatToVND} from "@/lib/utils";
import {toast} from "sonner";
import {Product} from "@prisma/client";


function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.quantity
    })

    toast.success("Đã thêm vào giỏ hàng!", {
      description: `1 ${product.name} đã được thêm vào giỏ hàng của bạn.`,
    })
  }

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
            products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <img
                          src={`/products/${product.id}/0.jpg`}
                          alt={product.name}
                          className="w-full h-72 object-cover mb-4"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                      />
                    </Link>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    </Link>
                    <p className="text-gray-600">{formatToVND(product.price)}</p>
                    <div className="mt-2">
                <span className={`text-sm ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                        className="w-full"
                        disabled={product.quantity === 0}
                        onClick={() => handleAddToCart(product)}
                    >
                      {product.quantity === 0 ? 'Hết hàng' : 'Thêm vảo giỏ hàng'}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
        )}
      </div>
  )
}
