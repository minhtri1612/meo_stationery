"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ShippingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    apartment: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("visa")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, gender: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Store user details for order creation
    localStorage.setItem('userDetails', JSON.stringify(formData))

    if (paymentMethod === "cod") {
      // Create order with COD payment
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]')
      const total = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          userDetails: formData,
          paymentDetails: {
            amount: total,
            method: 'COD',
            status: 'PENDING'
          }
        })
      })
      router.push("/checkout/confirmation")
    } else if (paymentMethod === "VNPAY") {
      router.push("/checkout/payment?method=VNPAY")
    } else {
      router.push("/checkout/payment?method=visa")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Shipping Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={handleGenderChange} defaultValue={formData.gender}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="street">Street Address</Label>
          <Input id="street" name="street" value={formData.street} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="ward">Ward</Label>
          <Input id="ward" name="ward" value={formData.ward} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="district">District</Label>
          <Input id="district" name="district" value={formData.district} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" value={formData.country} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="apartment">Apartment (Optional)</Label>
          <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <RadioGroup defaultValue="visa" onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="visa" id="visa" />
              <Label htmlFor="visa">Visa</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="momo" id="momo" />
              <Label htmlFor="momo">MoMo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VNPAY" id="VNPAY" />
              <Label htmlFor="VNPAY">VNPAY</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod">Cash on Delivery</Label>
            </div>
          </RadioGroup>
        </div>
        <Button type="submit">Proceed to Payment</Button>
      </form>
    </div>
  )
}
