import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { cartItems, userDetails, paymentDetails } = await request.json();

  try {
    // Create address first
    const address = await prisma.address.create({
      data: {
        street: userDetails.street,
        ward: userDetails.ward,
        district: userDetails.district,
        city: userDetails.city,
        country: userDetails.country,
        apartment: userDetails.apartment,
      },
    });

    // Create user with address relation
    const user = await prisma.user.create({
      data: {
        fullName: userDetails.fullName,
        email: userDetails.email,
        gender: userDetails.gender,
        dateOfBirth: userDetails.dateOfBirth,
        createdAt: new Date().toISOString(),
        addressId: address.id,
      },
    });

    // Create order with nested items and payment
    const order = await prisma.$transaction(async (tx) => {
      // Update product quantities
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            quantity: {
              decrement: item.quantity
            },
            stock: {
              set: item.quantity <= 1 ? 'OUT_OF_STOCK' : 'IN_STOCK'
            }
          }
        });
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          createdAt: new Date().toISOString(),
          items: {
            createMany: {
              data: cartItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
              })),
            },
          },
        },
      });

    // Create payment record separately
      const payment = await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: paymentDetails.amount,
          method: paymentDetails.method,
          status: paymentDetails.status,
          createdAt: new Date().toISOString(),
        },
      });

      return newOrder;
    });


    return NextResponse.json({
      success: true,
      data: { order, user, address }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}