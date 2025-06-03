import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Transaction {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  products: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
    size?: string
  }>
  total: number
  status: 'completed' | 'pending' | 'cancelled' | 'success' | 'failed'
  createdAt: string
  reference?: string
  currency?: string
  subtotal?: number
  tax?: number
}

interface UseTransactionsReturn {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
  size?: string
  total?: number
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const transformFirestoreTransaction = (doc: QueryDocumentSnapshot<DocumentData>): Transaction => {
    const data = doc.data()
    
    // Handle both old and new transaction formats
    let products = []
    if (data.cartItems) {
      // New format from client
      products = data.cartItems.map((item: CartItem) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size
      }))
    } else if (data.products) {
      // Existing format
      products = data.products
    }

    // Map status values
    let status = data.status
    if (status === 'success') {
      status = 'completed'
    } else if (status === 'failed') {
      status = 'cancelled'
    }

    return {
      id: doc.id,
      customerId: data.customerData?.email || data.customerId || '',
      customerName: data.customerData?.fullName || data.customerName || 'Unknown Customer',
      customerEmail: data.customerData?.email || data.customerEmail || '',
      products,
      total: data.total || data.amount || 0,
      status: status as Transaction['status'],
      createdAt: data.createdAt || new Date().toISOString(),
      reference: data.reference,
      currency: data.currency,
      subtotal: data.subtotal,
      tax: data.tax
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const transactionsRef = collection(db, 'transactions')
      const q = query(transactionsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const fetchedTransactions: Transaction[] = []
      querySnapshot.forEach((doc) => {
        try {
          const transaction = transformFirestoreTransaction(doc)
          fetchedTransactions.push(transaction)
        } catch (err) {
          console.warn('Error transforming transaction:', doc.id, err)
        }
      })
      
      setTransactions(fetchedTransactions)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()

    // Set up real-time listener
    const transactionsRef = collection(db, 'transactions')
    const q = query(transactionsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTransactions: Transaction[] = []
      querySnapshot.forEach((doc) => {
        try {
          const transaction = transformFirestoreTransaction(doc)
          fetchedTransactions.push(transaction)
        } catch (err) {
          console.warn('Error transforming transaction:', doc.id, err)
        }
      })
      setTransactions(fetchedTransactions)
      setLoading(false)
    }, (err) => {
      console.error('Error listening to transactions:', err)
      setError('Failed to listen for transaction updates')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  }
} 