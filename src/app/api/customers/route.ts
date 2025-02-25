import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const customers = await prisma.user.findMany({
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        },
                        payment: true
                    }
                }
            }
        })

        const formattedCustomers = customers.map(customer => {
            const totalOrders = customer.orders.length
            const totalSpent = customer.orders.reduce((acc, order) => {
                const orderTotal = order.payment.reduce((sum, payment) => sum + payment.amount, 0)
                return acc + orderTotal
            }, 0)
            const lastOrder = customer.orders[0]

            return {
                id: customer.id,
                name: customer.fullName,
                email: customer.email,
                totalOrders,
                totalSpent,
                lastOrderDate: lastOrder?.createdAt || 'No orders',
                orders: customer.orders.map(order => ({
                    id: order.id.toString(),
                    date: order.createdAt,
                    total: order.payment.reduce((sum, payment) => sum + payment.amount, 0),
                    status: order.status
                }))
            }
        })

        return NextResponse.json(formattedCustomers)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
    }
}
