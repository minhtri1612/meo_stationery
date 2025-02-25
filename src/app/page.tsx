
import { prisma } from '@/lib/prisma'
import ProductGrid from "@/components/products/ProductGrid";

export default async function Home() {

  const categories = await prisma.category.findMany({
    include: {
      products: true,
      children: true
    },
    where: {
      parentId: null
    }
  })

  return (
      <div className="pt-16">
        <h1 className="text-3xl font-bold mb-8">Welcome to StationeryShop</h1>
          <ProductGrid categories={categories}/>
      </div>
  )
}
