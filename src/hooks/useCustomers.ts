import { useState, useEffect } from 'react'
import { collection, getDocs, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTransactionsByCustomer } from '@/lib/transactions'

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  orders: number
  totalSpent: number
  joinedAt: string
  status: "Active" | "Inactive" | "Pending"
  lastOrderDate?: string
}

interface UseCustomersReturn {
  customers: Customer[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface CustomerData {
  email: string
  fullName?: string
  name?: string
  phone?: string
  location?: string
  createdAt?: string
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateCustomerStats = async (customerData: CustomerData): Promise<{ orders: number; totalSpent: number; lastOrderDate?: string; status: Customer["status"] }> => {
    try {
      const transactions = await getTransactionsByCustomer(customerData.email)
      const completedTransactions = transactions.filter(t => t.status === 'completed')
      
      const orders = completedTransactions.length
      const totalSpent = completedTransactions.reduce((sum, t) => sum + t.total, 0)
      
      // Get the most recent order date
      const lastOrderDate = completedTransactions.length > 0 
        ? completedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : undefined

      // Determine status based on activity
      let status: Customer["status"] = "Pending"
      if (orders > 0) {
        const lastOrder = lastOrderDate ? new Date(lastOrderDate) : null
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        if (lastOrder && lastOrder > thirtyDaysAgo) {
          status = "Active"
        } else if (lastOrder) {
          status = "Inactive"
        }
      }

      return { orders, totalSpent, lastOrderDate, status }
    } catch (error) {
      console.error('Error calculating customer stats:', error)
      return { orders: 0, totalSpent: 0, status: "Pending" }
    }
  }

  const transformCustomerData = async (doc: QueryDocumentSnapshot<DocumentData>): Promise<Customer> => {
    const data = doc.data() as CustomerData
    const stats = await calculateCustomerStats(data)
    
    return {
      id: doc.id,
      name: data.fullName || data.name || 'Unknown Customer',
      email: data.email,
      phone: data.phone,
      location: data.location,
      orders: stats.orders,
      totalSpent: stats.totalSpent,
      joinedAt: data.createdAt || new Date().toISOString(),
      status: stats.status,
      lastOrderDate: stats.lastOrderDate
    }
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const customersRef = collection(db, 'customers')
      const querySnapshot = await getDocs(customersRef)
      
      const fetchedCustomers: Customer[] = []
      
      // Process customers in parallel
      const customerPromises = querySnapshot.docs.map(doc => transformCustomerData(doc))
      const transformedCustomers = await Promise.all(customerPromises)
      
      fetchedCustomers.push(...transformedCustomers)
      
      // Sort by total spent (descending) by default
      fetchedCustomers.sort((a, b) => b.totalSpent - a.totalSpent)
      
      setCustomers(fetchedCustomers)
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()

    // Set up real-time listener for customers
    const customersRef = collection(db, 'customers')
    const unsubscribe = onSnapshot(customersRef, async (querySnapshot) => {
      try {
        const fetchedCustomers: Customer[] = []
        
        const customerPromises = querySnapshot.docs.map(doc => transformCustomerData(doc))
        const transformedCustomers = await Promise.all(customerPromises)
        
        fetchedCustomers.push(...transformedCustomers)
        fetchedCustomers.sort((a, b) => b.totalSpent - a.totalSpent)
        
        setCustomers(fetchedCustomers)
        setLoading(false)
      } catch (err) {
        console.error('Error processing customer updates:', err)
        setError('Failed to process customer updates')
        setLoading(false)
      }
    }, (err) => {
      console.error('Error listening to customers:', err)
      setError('Failed to listen for customer updates')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers
  }
} 