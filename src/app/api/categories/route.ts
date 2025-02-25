import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const category = url.searchParams.get('category')

  if (!category) {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null
      },
      include: {
        children: {
          include: {
            products: true
          }
        },
        products: true
      }
    })
    return NextResponse.json(categories)
  }

  const categoryData = await prisma.category.findFirst({
    where: {
      catName: {
        equals: category,
        mode: 'insensitive'
      }
    },
    include: {
      children: {
        include: {
          products: true
        }
      },
      products: true
    }
  })

  return NextResponse.json(categoryData)
}
