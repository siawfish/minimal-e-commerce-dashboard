import { ShoppingBagIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductSalesData {
  id: string
  name: string
  quantity: number
  revenue: number
}

interface ProductStatsProps {
  products: ProductSalesData[]
}

export function ProductStats({ products }: ProductStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const maxRevenue = Math.max(...products.map(p => p.revenue))
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0)
  const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBagIcon className="h-5 w-5" />
          Top Products
        </CardTitle>
        <CardDescription>
          Best-selling products by revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {totalQuantity} units sold • {products.length} products
          </p>
        </div>
        
        <div className="space-y-4">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div key={product.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium truncate">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.quantity} sold
                    </div>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBagIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No product sales data available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 