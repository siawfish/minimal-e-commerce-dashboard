import { doc, updateDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { Transaction } from '@/hooks/useTransactions'

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
  size?: string
  total?: number
}

export async function updateTransactionStatus(
  transactionId: string, 
  status: Transaction['status']
): Promise<void> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId)
    await updateDoc(transactionRef, {
      status,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating transaction status:', error)
    throw new Error('Failed to update transaction status')
  }
}

export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  try {
    const transactionRef = doc(db, 'transactions', transactionId)
    const transactionSnap = await getDoc(transactionRef)
    
    if (transactionSnap.exists()) {
      const data = transactionSnap.data()
      
      // Transform the data to match our Transaction interface
      let products = []
      if (data.cartItems) {
        products = data.cartItems.map((item: CartItem) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        }))
      } else if (data.products) {
        products = data.products
      }

      let status = data.status
      if (status === 'success') {
        status = 'completed'
      } else if (status === 'failed') {
        status = 'cancelled'
      }

      return {
        id: transactionSnap.id,
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
    
    return null
  } catch (error) {
    console.error('Error fetching transaction:', error)
    throw new Error('Failed to fetch transaction')
  }
}

export async function getTransactionsByCustomer(customerEmail: string): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'transactions')
    const q = query(
      transactionsRef, 
      where('customerData.email', '==', customerEmail)
    )
    const querySnapshot = await getDocs(q)
    
    const transactions: Transaction[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      let products = []
      if (data.cartItems) {
        products = data.cartItems.map((item: CartItem) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        }))
      } else if (data.products) {
        products = data.products
      }

      let status = data.status
      if (status === 'success') {
        status = 'completed'
      } else if (status === 'failed') {
        status = 'cancelled'
      }

      transactions.push({
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
      })
    })
    
    return transactions
  } catch (error) {
    console.error('Error fetching customer transactions:', error)
    throw new Error('Failed to fetch customer transactions')
  }
}

export async function cancelTransaction(transactionId: string): Promise<void> {
  await updateTransactionStatus(transactionId, 'cancelled')
}

export async function completeTransaction(transactionId: string): Promise<void> {
  await updateTransactionStatus(transactionId, 'completed')
}

export function formatTransactionId(id: string): string {
  // Convert Firestore document ID to display format
  return `TXN${id.slice(-6).toUpperCase()}`
}

export function getStatusColor(status: Transaction['status']): string {
  switch (status) {
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'cancelled':
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-zinc-600 bg-zinc-50 border-zinc-200'
  }
}

export function formatCurrency(amount: number, currency: string = 'GHS'): string {
  const symbol = currency === 'GHS' ? '₵' : currency
  return `${symbol}${amount.toLocaleString()}`
} 