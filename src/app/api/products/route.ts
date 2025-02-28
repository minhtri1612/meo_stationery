import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/products/:id
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: id
    }
  });

  return NextResponse.json(product);
}
// POST /api/products
export async function POST(request: Request) {
  const data = await request.json();
  const product = await prisma.product.create({
    data: {
      id: data.id,
      name: data.name,
      price: parseInt(data.price),
      quantity: parseInt(data.quantity),
      description: data.description
    }
  });
  return NextResponse.json(product);
}

// PUT /api/products/:id
export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const data = await request.json();

  const product = await prisma.product.update({
    where: {
      id: id!
    },
    data: {
      name: data.name,
      price: parseInt(data.price),
      quantity: parseInt(data.quantity),
      description: data.description
    }
  });

  return NextResponse.json(product);
}

// DELETE /api/products/:id 
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  const product = await prisma.product.delete({
    where: {
      id: id!
    }
  });

  return NextResponse.json(product);
}