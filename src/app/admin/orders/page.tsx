"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {formatToVND} from "@/lib/utils";
import {Dialog, DialogContent, DialogTitle, DialogHeader} from "@/components/ui/dialog";

interface OrderItem {
    orderId: number
    productId: number
    quantity: number
    product: {
        name: string
        price: number
    }
}

interface Order {
  id: number
  userId: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  user: {
    fullName: string
    email: string
  }
  payment: {
    amount: number
  }[]
  items: OrderItem[]
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders')
                const data = await response.json()
                setOrders(data.orders)
            } catch (error) {
                console.error('Failed to fetch orders:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const filteredOrders = orders.filter(
        (order) =>
            (order.id.toString().includes(search.toLowerCase()) ||
                order.user.fullName.toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === "All" || order.status === statusFilter)
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-500"
            case "PROCESSING":
                return "bg-blue-500"
            case "SHIPPED":
                return "bg-yellow-500"
            case "PENDING":
                return "bg-orange-500"
            case "CANCELLED":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
    
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search orders..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
    
                <Card>
                    <CardHeader>
                        <CardTitle>Order List</CardTitle>
                        <CardDescription>Manage and review all customer orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">Loading orders...</TableCell>
                                    </TableRow>
                                ) : filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.user.fullName}</TableCell>
                                        <TableCell>{order.user.email}</TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>{formatToVND(order.payment[0]?.amount || 0)}</TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm font-medium">Order ID:</div>
                                    <div className="text-sm">{selectedOrder.id}</div>

                                    <div className="text-sm font-medium">Status:</div>
                                    <div className="text-sm">
                                        <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                                            {selectedOrder.status}
                                        </Badge>
                                    </div>

                                    <div className="text-sm font-medium">Date:</div>
                                    <div className="text-sm">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                    </div>

                                    <div className="text-sm font-medium">Customer:</div>
                                    <div className="text-sm">{selectedOrder.user.fullName}</div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-medium mb-2">Order Items:</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item) => (
                                            <div key={`${item.orderId}-${item.productId}`}
                                                 className="flex justify-between items-center border-b pb-2">
                                                <div>
                                                    <div className="text-sm font-medium">{item.product.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Quantity: {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {formatToVND(item.product.price * item.quantity)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="text-sm font-medium">Total Amount:</div>
                                    <div className="text-lg font-bold">
                                        {formatToVND(selectedOrder.payment[0]?.amount || 0)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
