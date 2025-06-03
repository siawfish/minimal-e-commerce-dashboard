"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { getAllProducts } from "@/lib/products"
import type { Product } from "@/types/firebase"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw, Plus } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

// Define the product table data type
type ProductTableData = {
  id: number
  productId: string // Add Firebase product ID
  name: string
  category: string
  status: string
  price: string
  quantity: number // Add quantity field
  sizes: string
  description: string
  thumbnail: string // Add thumbnail URL
}

// Custom columns for products table
const productColumns: ColumnDef<ProductTableData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: ({ row }) => {
      const thumbnail = row.getValue("thumbnail") as string
      const name = row.getValue("name") as string
      return (
        <div className="flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`${name} thumbnail`}
              className="h-12 w-12 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-400">No image</span>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-2 py-1">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={status === "Active" ? "default" : "secondary"}
          className="px-2 py-1"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("price")}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      return (
        <div className="font-medium">
          <Badge 
            variant={quantity > 10 ? "default" : quantity > 0 ? "secondary" : "destructive"}
            className="px-2 py-1"
          >
            {quantity}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "sizes",
    header: "Sizes",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-[100px] truncate">
        {row.getValue("sizes")}
      </div>
    ),
  },
]

// Mobile Card Component for product display
function ProductCard({ 
  product, 
  isSelected, 
  onSelect, 
  onClick 
}: { 
  product: ProductTableData
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onClick: () => void
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Checkbox */}
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label="Select product"
            />
          </div>
          
          {/* Product Image */}
          <div className="flex-shrink-0">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={`${product.name} thumbnail`}
                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">No image</span>
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base leading-tight truncate">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                  <Badge
                    variant={product.status === "Active" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Price and Quantity Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-muted-foreground">Price</span>
                  <div className="font-semibold text-lg">{product.price}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Qty</span>
                  <div className="mt-1">
                    <Badge 
                      variant={product.quantity > 10 ? "default" : product.quantity > 0 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {product.quantity}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sizes */}
            {product.sizes && (
              <div>
                <span className="text-sm text-muted-foreground">Sizes: </span>
                <span className="text-sm">{product.sizes}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom ProductTable component
function ProductTable({ data }: { data: ProductTableData[] }) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns: productColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const handleRowClick = (productId: string) => {
    router.push(`/product?id=${productId}`)
  }

  const currentPageData = table.getRowModel().rows.map(row => row.original)

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(row.original.productId)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          className="py-4"
                          onClick={(e) => {
                            // Prevent row click when clicking on checkbox
                            if (cell.column.id === 'select') {
                              e.stopPropagation()
                            }
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={productColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {currentPageData.length > 0 ? (
          currentPageData.map((product) => {
            const row = table.getRowModel().rows.find(r => r.original.id === product.id)
            const isSelected = row?.getIsSelected() || false
            
            return (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={isSelected}
                onSelect={(checked) => row?.toggleSelected(checked)}
                onClick={() => handleRowClick(product.productId)}
              />
            )
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
        <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
          <span className="hidden sm:inline">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
          <span className="sm:hidden">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const fetchedProducts = await getAllProducts()
      setProducts(fetchedProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
      showToast(err instanceof Error ? err.message : 'Failed to fetch products', 'error')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchProducts()
  }, [])

  const handleAddProduct = () => {
    router.push('/product')
  }

  const handleRefresh = () => {
    fetchProducts()
  }

  // Transform Firebase products to DataTable format
  const transformProductsForTable = (products: Product[]) => {
    return products.map((product, index) => ({
      id: index + 1, // Use index as display ID for DataTable
      productId: product.id!, // Add Firebase product ID
      name: product.name, // Product Name
      category: product.category, // Product Category 
      status: product.isActive ? "Active" : "Inactive", // Product Status
      price: `₵${product.price.toFixed(2)}`, // Product Price
      quantity: product.quantity, // Add quantity field
      sizes: product.sizes.join(', '), // Available Sizes
      description: product.description || "No description", // Product Description
      thumbnail: product.images[0] || "" // Add thumbnail URL
    }))
  }

  if (loading) {
    return (
      <div className="min-h-full space-y-6 sm:space-y-8 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your product inventory and details
            </p>
          </div>
          <Button onClick={handleAddProduct} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
        
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-base sm:text-lg">Loading products...</span>
          </div>
        </div>
        {ToastComponent}
      </div>
    )
  }

  return (
    <div className="min-h-full space-y-6 sm:space-y-8 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddProduct} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 px-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">Get started by creating your first product.</p>
          <Button onClick={handleAddProduct} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <ProductTable data={transformProductsForTable(products)} />
        </>
      )}
      
      {ToastComponent}
    </div>
  )
} 