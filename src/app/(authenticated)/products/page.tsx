"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { z } from "zod"

// Product schema for the data table
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  sizes: z.array(z.string()),
  category: z.string(),
  stock: z.number(),
})

type Product = z.infer<typeof productSchema>

// Product data
const products: Product[] = [
  {
    id: "PROD001",
    name: "YEEZY BOOST 350 V2",
    price: 200,
    image: "/api/placeholder/300/300",
    description: "Iconic sneaker with distinctive silhouette",
    sizes: ["8", "9", "10", "11", "12"],
    category: "Sneakers",
    stock: 45,
  },
  {
    id: "PROD002",
    name: "YEEZY SLIDE",
    price: 80,
    image: "/api/placeholder/300/300", 
    description: "Minimalist slide sandal",
    sizes: ["8", "9", "10", "11", "12"],
    category: "Slides",
    stock: 78,
  },
  {
    id: "PROD003",
    name: "YEEZY FOAM RUNNER",
    price: 200,
    image: "/api/placeholder/300/300",
    description: "Futuristic foam clog design",
    sizes: ["8", "9", "10", "11", "12"],
    category: "Sneakers",
    stock: 23,
  },
  {
    id: "PROD004",
    name: "YEEZY 700 V3",
    price: 300,
    image: "/api/placeholder/300/300",
    description: "Bold chunky sneaker silhouette",
    sizes: ["8", "9", "10", "11", "12"],
    category: "Sneakers",
    stock: 12,
  },
  {
    id: "PROD005",
    name: "YEEZY GAP HOODIE",
    price: 90,
    image: "/api/placeholder/300/300",
    description: "Oversized hoodie in neutral tone",
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "Apparel",
    stock: 67,
  },
  {
    id: "PROD006",
    name: "YEEZY NSLTD BT",
    price: 180,
    image: "/api/placeholder/300/300",
    description: "High-top boot construction",
    sizes: ["8", "9", "10", "11", "12"],
    category: "Boots",
    stock: 34,
  },
]

export default function Products() {
  return (
    <div className="min-h-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <Button>
          Add Product
        </Button>
      </div>

      {/* Using the generic DataTable with adapted product data */}
      <DataTable 
        data={products.map(product => ({
          id: parseInt(product.id.replace('PROD', '')),
          header: product.name,
          type: product.category,
          status: product.stock > 20 ? "In Stock" : "Low Stock",
          target: product.stock.toString(),
          limit: "100",
          reviewer: "Unassigned"
        }))}
      />
    </div>
  )
} 