"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Sample data - in a real app, this would come from your API
const initialCustomers = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        totalOrders: 5,
        totalSpent: 250.5,
        lastOrderDate: "2023-05-15",
        orders: [
            { id: "1001", date: "2023-05-15", total: 50.99, status: "Completed" },
            { id: "1002", date: "2023-04-20", total: 75.5, status: "Completed" },
            { id: "1003", date: "2023-03-10", total: 124.01, status: "Completed" },
        ],
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        totalOrders: 3,
        totalSpent: 150.25,
        lastOrderDate: "2023-05-10",
        orders: [
            { id: "1004", date: "2023-05-10", total: 60.25, status: "Completed" },
            { id: "1005", date: "2023-04-05", total: 45.0, status: "Completed" },
            { id: "1006", date: "2023-03-01", total: 45.0, status: "Completed" },
        ],
    },
    {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        totalOrders: 2,
        totalSpent: 80.0,
        lastOrderDate: "2023-05-05",
        orders: [
            { id: "1007", date: "2023-05-05", total: 40.0, status: "Completed" },
            { id: "1008", date: "2023-04-15", total: 40.0, status: "Completed" },
        ],
    },
]

export default function CustomersPage() {
    const [customers, setCustomers] = useState(initialCustomers)
    const [search, setSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<(typeof initialCustomers)[0] | null>(null)

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(search.toLowerCase()) ||
            customer.email.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
    
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
    
                <Card>
                    <CardHeader>
                        <CardTitle>Customer List</CardTitle>
                        <CardDescription>View and manage all customer information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Total Orders</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Last Order</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>{customer.email}</TableCell>
                                        <TableCell>{customer.totalOrders}</TableCell>
                                        <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                                        <TableCell>{customer.lastOrderDate}</TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                                                        View Orders
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[625px]">
                                                    <DialogHeader>
                                                        <DialogTitle>{customer.name}'s Orders</DialogTitle>
                                                        <DialogDescription>Order history for {customer.email}</DialogDescription>
                                                    </DialogHeader>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Order ID</TableHead>
                                                                <TableHead>Date</TableHead>
                                                                <TableHead>Total</TableHead>
                                                                <TableHead>Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customer.orders.map((order) => (
                                                                <TableRow key={order.id}>
                                                                    <TableCell>{order.id}</TableCell>
                                                                    <TableCell>{order.date}</TableCell>
                                                                    <TableCell>${order.total.toFixed(2)}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">{order.status}</Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

