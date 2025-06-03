import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore'
import { db } from './firebase'

export interface CustomerFirestoreData {
  email: string
  fullName: string
  phone?: string
  location?: string
  createdAt: string
  updatedAt: string
}

/**
 * Get all customers from Firestore
 */
export async function getAllCustomers(): Promise<CustomerFirestoreData[]> {
  try {
    const customersRef = collection(db, 'customers')
    const q = query(customersRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const customers: CustomerFirestoreData[] = []
    querySnapshot.forEach((doc) => {
      customers.push({
        ...doc.data() as CustomerFirestoreData
      })
    })
    
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    throw new Error('Failed to fetch customers')
  }
}

/**
 * Get a single customer by email
 */
export async function getCustomerByEmail(email: string): Promise<CustomerFirestoreData | null> {
  try {
    const customerRef = doc(db, 'customers', email)
    const customerSnap = await getDoc(customerRef)
    
    if (customerSnap.exists()) {
      return customerSnap.data() as CustomerFirestoreData
    }
    
    return null
  } catch (error) {
    console.error('Error fetching customer:', error)
    throw new Error('Failed to fetch customer')
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(customerData: Omit<CustomerFirestoreData, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', customerData.email)
    const now = new Date().toISOString()
    
    await setDoc(customerRef, {
      ...customerData,
      createdAt: now,
      updatedAt: now
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(email: string, updates: Partial<Omit<CustomerFirestoreData, 'email' | 'createdAt'>>): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', email)
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    throw new Error('Failed to update customer')
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(email: string): Promise<void> {
  try {
    const customerRef = doc(db, 'customers', email)
    await deleteDoc(customerRef)
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw new Error('Failed to delete customer')
  }
}

/**
 * Search customers by name or email
 */
export async function searchCustomers(searchTerm: string): Promise<CustomerFirestoreData[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that filters on the client side
    const customers = await getAllCustomers()
    
    return customers.filter(customer => 
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  } catch (error) {
    console.error('Error searching customers:', error)
    throw new Error('Failed to search customers')
  }
} 