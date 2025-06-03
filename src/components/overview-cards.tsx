import { TrendingDownIcon, TrendingUpIcon, ShoppingBagIcon, UsersIcon, DollarSignIcon, ShoppingCartIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OverviewData {
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  totalTransactions: number
  revenueGrowth: number
  customerGrowth: number
}

interface OverviewCardsProps {
  data: OverviewData
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${
                data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {data.revenueGrowth >= 0 ? (
                <TrendingUpIcon className="h-3 w-3" />
              ) : (
                <TrendingDownIcon className="h-3 w-3" />
              )}
              {formatPercentage(data.revenueGrowth)}
            </Badge>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalCustomers)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${
                data.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {data.customerGrowth >= 0 ? (
                <TrendingUpIcon className="h-3 w-3" />
              ) : (
                <TrendingDownIcon className="h-3 w-3" />
              )}
              {formatPercentage(data.customerGrowth)}
            </Badge>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalProducts)}</div>
          <p className="text-xs text-muted-foreground">
            Active products in catalog
          </p>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(data.totalTransactions)}</div>
          <p className="text-xs text-muted-foreground">
            Successfully processed orders
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 