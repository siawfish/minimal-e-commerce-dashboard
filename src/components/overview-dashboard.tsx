"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy, limit, DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { OverviewCards } from "@/components/overview-cards"
import { RevenueChart } from "@/components/revenue-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { ProductStats } from "@/components/product-stats"

interface TransactionData extends DocumentData {
  status: string
  total?: number
  amount?: number
  createdAt: string
  cartItems?: CartItem[]
  products?: CartItem[]
  customerData?: {
    fullName: string
    email: string
  }
  customerName?: string
  customerEmail?: string
  reference?: string
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
  size?: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
}

interface TopProduct {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface CustomerDoc extends DocumentData {
  createdAt: string
}

interface OverviewData {
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  totalTransactions: number
  revenueGrowth: number
  customerGrowth: number
  recentTransactions: TransactionData[]
  monthlyRevenue: MonthlyRevenue[]
  topProducts: TopProduct[]
}

export function OverviewDashboard() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true)
        
        // Fetch all necessary data in parallel
        const [
          customersSnapshot,
          productsSnapshot,
          transactionsSnapshot,
          recentTransactionsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, 'customers')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'transactions')),
          getDocs(query(
            collection(db, 'transactions'),
            where('status', 'in', ['completed', 'success']),
            orderBy('createdAt', 'desc'),
            limit(10)
          )),
        ])

        // Process transactions for revenue calculation
        const allTransactions: TransactionData[] = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TransactionData))

        const completedTransactions = allTransactions.filter(t => 
          t.status === 'completed' || t.status === 'success'
        )

        // Calculate total revenue
        const totalRevenue = completedTransactions.reduce((sum, transaction) => {
          return sum + (transaction.total || transaction.amount || 0)
        }, 0)

        // Calculate monthly revenue for the last 6 months
        const monthlyRevenue = calculateMonthlyRevenue(completedTransactions)

        // Calculate growth metrics
        const { revenueGrowth, customerGrowth } = calculateGrowthMetrics(
          completedTransactions,
          customersSnapshot.docs
        )

        // Get top-selling products
        const topProducts = calculateTopProducts(completedTransactions)

        // Recent transactions for display
        const recentTransactions: TransactionData[] = recentTransactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TransactionData))

        setData({
          totalRevenue,
          totalCustomers: customersSnapshot.size,
          totalProducts: productsSnapshot.size,
          totalTransactions: completedTransactions.length,
          revenueGrowth,
          customerGrowth,
          recentTransactions,
          monthlyRevenue,
          topProducts,
        })

      } catch (err) {
        console.error('Error fetching overview data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!data) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards data={data} />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.monthlyRevenue} />
        <ProductStats products={data.topProducts} />
      </div>
      
      {/* Recent Transactions */}
      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}

// Helper functions
function calculateMonthlyRevenue(transactions: TransactionData[]): MonthlyRevenue[] {
  const monthlyData: { [key: string]: number } = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (transaction.total || transaction.amount || 0)
  })

  // Get last 6 months
  const months: MonthlyRevenue[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    months.push({
      month: monthName,
      revenue: monthlyData[monthKey] || 0
    })
  }

  return months
}

function calculateGrowthMetrics(transactions: TransactionData[], customers: DocumentData[]) {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  // Revenue growth
  const lastMonthRevenue = transactions
    .filter(t => {
      const date = new Date(t.createdAt)
      return date >= lastMonth && date < now
    })
    .reduce((sum, t) => sum + (t.total || t.amount || 0), 0)

  const previousMonthRevenue = transactions
    .filter(t => {
      const date = new Date(t.createdAt)
      return date >= twoMonthsAgo && date < lastMonth
    })
    .reduce((sum, t) => sum + (t.total || t.amount || 0), 0)

  const revenueGrowth = previousMonthRevenue > 0 
    ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0

  // Customer growth (simplified - based on when customers were created)
  const lastMonthCustomers = customers.filter(doc => {
    const data = doc.data() as CustomerDoc
    const date = new Date(data.createdAt)
    return date >= lastMonth && date < now
  }).length

  const previousMonthCustomers = customers.filter(doc => {
    const data = doc.data() as CustomerDoc
    const date = new Date(data.createdAt)
    return date >= twoMonthsAgo && date < lastMonth
  }).length

  const customerGrowth = previousMonthCustomers > 0 
    ? ((lastMonthCustomers - previousMonthCustomers) / previousMonthCustomers) * 100 
    : 0

  return { revenueGrowth, customerGrowth }
}

function calculateTopProducts(transactions: TransactionData[]): TopProduct[] {
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

  transactions.forEach(transaction => {
    const products = transaction.cartItems || transaction.products || []
    products.forEach((item: CartItem) => {
      const productId = item.productId || item.productId
      const productName = item.productName || item.productName || 'Unknown Product'
      const quantity = item.quantity || 1
      const price = item.price || 0

      if (!productSales[productId]) {
        productSales[productId] = {
          name: productName,
          quantity: 0,
          revenue: 0
        }
      }

      productSales[productId].quantity += quantity
      productSales[productId].revenue += quantity * price
    })
  })

  return Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
} 