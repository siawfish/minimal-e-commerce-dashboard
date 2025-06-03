# Customers Implementation

This document explains the customers implementation with Firestore integration for the e-commerce dashboard.

## Overview

The customers feature provides a complete dashboard for managing customer relationships, including:

- **Real-time customer data** from Firestore
- **Order statistics** calculated from transaction history
- **Customer status tracking** (Active, Inactive, Pending)
- **Search and filtering** capabilities
- **Sorting** by various fields
- **Pagination** for large datasets

## Files Structure

```
dashboard/src/
├── hooks/
│   └── useCustomers.ts          # React hook for customer data management
├── lib/
│   ├── customers.ts             # Customer CRUD operations
│   └── transactions.ts          # Transaction utilities (existing)
└── app/(authenticated)/customers/
    └── page.tsx                 # Customers page component
```

## Data Structure

### Customer Interface
```typescript
interface Customer {
  id: string                     // Document ID (email)
  name: string                   // Customer full name
  email: string                  // Customer email (unique)
  phone?: string                 // Optional phone number
  location?: string              // Optional delivery location
  orders: number                 // Total completed orders
  totalSpent: number             // Total amount spent (GHS)
  joinedAt: string              // Account creation date
  status: "Active" | "Inactive" | "Pending"
  lastOrderDate?: string         // Date of most recent order
}
```

### Firestore Structure
```typescript
// Collection: customers
// Document ID: customer email
{
  email: string
  fullName: string
  phone?: string
  location?: string
  createdAt: string
  updatedAt: string
}
```

## Features Implemented

### 1. Real-time Data Fetching
- Uses Firestore `onSnapshot` for real-time updates
- Automatically syncs when new customers are added
- Handles loading and error states

### 2. Order Statistics Calculation
- Fetches transaction history for each customer
- Calculates total orders and spending
- Determines customer status based on activity:
  - **Active**: Has orders in the last 30 days
  - **Inactive**: Has orders but none in the last 30 days
  - **Pending**: No completed orders

### 3. Search Functionality
- Real-time search across name, email, and ID
- Case-insensitive matching
- Instant results as you type

### 4. Sorting Capabilities
- Sort by: Name, Orders, Total Spent, Join Date
- Ascending/descending order
- Visual indicators for sort direction

### 5. Pagination
- Configurable page size (default: 10)
- Navigation controls
- Shows current page and total pages

### 6. Loading & Error States
- Loading spinner during data fetch
- Error message with retry option
- Empty state when no customers found

## Usage

### Basic Usage
```typescript
import { useCustomers } from '@/hooks/useCustomers'

function CustomersPage() {
  const { customers, loading, error, refetch } = useCustomers()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage onRetry={refetch} />
  
  return (
    <CustomerTable customers={customers} />
  )
}
```

### Customer Operations
```typescript
import { 
  createCustomer, 
  updateCustomer, 
  deleteCustomer, 
  getCustomerByEmail 
} from '@/lib/customers'

// Create a new customer
await createCustomer({
  email: 'john@example.com',
  fullName: 'John Doe',
  phone: '+233123456789',
  location: 'Accra, Ghana'
})

// Update customer
await updateCustomer('john@example.com', {
  phone: '+233987654321'
})

// Get single customer
const customer = await getCustomerByEmail('john@example.com')
```

## Data Flow

1. **Customer Registration**: When a customer places their first order:
   ```
   Client → Checkout → saveCustomer() → Firestore customers collection
   ```

2. **Dashboard Loading**: When viewing customers page:
   ```
   useCustomers() → Firestore customers → Calculate stats → Display
   ```

3. **Real-time Updates**: When new orders are placed:
   ```
   New Transaction → Firestore → onSnapshot → Recalculate stats → Update UI
   ```

## Performance Considerations

### Optimization Strategies
1. **Parallel Processing**: Customer stats are calculated in parallel using `Promise.all()`
2. **Real-time Listeners**: Uses Firestore `onSnapshot` for efficient updates
3. **Client-side Sorting/Filtering**: Reduces server requests
4. **Pagination**: Limits displayed data for better performance

### Potential Improvements
1. **Server-side Statistics**: Move calculations to Cloud Functions
2. **Indexed Search**: Implement Algolia for better search
3. **Virtual Scrolling**: For very large customer lists
4. **Caching**: Add customer data caching with React Query

## Error Handling

The implementation includes comprehensive error handling:

- **Network Errors**: Automatic retry with user feedback
- **Permission Errors**: Clear error messages
- **Data Validation**: Type-safe operations
- **Fallback Values**: Graceful degradation

## Security

### Firestore Rules
Customers data requires proper Firestore security rules:

```javascript
// Allow read access for authenticated users
match /customers/{email} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    request.auth.token.admin == true;
}
```

### Data Privacy
- Email is used as document ID for uniqueness
- Personal data (phone, location) is optional
- No sensitive payment information stored

## Testing

### Manual Testing Checklist
- [ ] Load customers page with existing data
- [ ] Search functionality works
- [ ] Sorting by different fields
- [ ] Pagination controls
- [ ] Real-time updates when new customers register
- [ ] Error handling with network issues
- [ ] Loading states display correctly

### Test Data
To add test customers for development:

```typescript
// Run in browser console on authenticated dashboard
import { createCustomer } from './lib/customers'

await createCustomer({
  email: 'test@example.com',
  fullName: 'Test Customer',
  phone: '+233123456789',
  location: 'Test Location'
})
```

## Future Enhancements

1. **Customer Details Modal**: View full customer information
2. **Customer Communication**: Email/SMS integration
3. **Customer Segmentation**: Advanced filtering and grouping
4. **Export Functionality**: CSV/Excel export
5. **Customer Insights**: Analytics and behavior tracking
6. **Bulk Operations**: Select and update multiple customers

## Troubleshooting

### Common Issues

1. **No customers showing**:
   - Check Firestore rules allow read access
   - Verify Firebase configuration
   - Check browser console for errors

2. **Stats not calculating**:
   - Ensure transactions collection exists
   - Verify transaction data format
   - Check customer email matching

3. **Real-time updates not working**:
   - Check internet connection
   - Verify Firestore rules
   - Look for console errors

### Debug Tools
- Firebase Console → Firestore → customers collection
- Browser DevTools → Network tab
- React DevTools → useCustomers hook state

---

This implementation provides a solid foundation for customer management that can be extended as business needs grow. 