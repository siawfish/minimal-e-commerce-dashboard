import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TransactionData {
  id: string
  customerData?: {
    fullName: string
    email: string
  }
  customerName?: string
  customerEmail?: string
  total?: number
  amount?: number
  status?: string
  createdAt?: string
  reference?: string
}

interface RecentTransactionsProps {
  transactions: TransactionData[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case 'failed':
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'failed':
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Latest customer orders and payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const customerName = transaction.customerData?.fullName || transaction.customerName || 'Unknown Customer'
                const customerEmail = transaction.customerData?.email || transaction.customerEmail || ''
                const amount = transaction.total || transaction.amount || 0
                const status = transaction.status || 'pending'
                const createdAt = transaction.createdAt || new Date().toISOString()
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{customerName}</div>
                        {customerEmail && (
                          <div className="text-sm text-muted-foreground">{customerEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`flex items-center gap-1 w-fit ${getStatusColor(status)}`}
                      >
                        {getStatusIcon(status)}
                        {status === 'success' ? 'completed' : status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {transaction.reference || 'N/A'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClockIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No recent transactions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 