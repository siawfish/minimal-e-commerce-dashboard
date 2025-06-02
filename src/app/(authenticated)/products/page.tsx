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
          className="hidden sm:flex"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="hidden sm:flex"
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
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover border border-gray-200"
            />
          ) : (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-400 hidden sm:block">No image</span>
              <span className="text-xs text-gray-400 sm:hidden">-</span>
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
      <div className="space-y-1">
        <div className="font-medium text-sm sm:text-base">{row.getValue("name")}</div>
        <div className="sm:hidden">
          <Badge variant="outline" className="px-1 py-0 text-xs">
            {row.getValue("category")}
          </Badge>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-2 py-1 hidden sm:inline-flex">
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
          className="px-1 sm:px-2 py-1 text-xs"
        >
          <span className="sm:hidden">{status === "Active" ? "✓" : "✕"}</span>
          <span className="hidden sm:inline">{status}</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="font-medium text-sm sm:text-base">{row.getValue("price")}</div>
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
            className="px-1 sm:px-2 py-1 text-xs"
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
      <div className="text-xs sm:text-sm text-muted-foreground hidden md:block max-w-[80px] truncate">
        {row.getValue("sizes")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-xs sm:text-sm text-muted-foreground hidden lg:block">
        {row.getValue("description")}
      </div>
    ),
  },
]

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

  const handleRowClick = (row: { original: ProductTableData }) => {
    const productId = row.original.productId
    router.push(`/product?id=${productId}`)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs sm:text-sm">
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
                    onClick={() => handleRowClick(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="py-2 sm:py-4 px-2 sm:px-4"
                        onClick={(e) => {
                          // Prevent row click when clicking on checkbox or thumbnail
                          if (cell.column.id === 'select' || cell.column.id === 'thumbnail') {
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
            className="text-xs sm:text-sm"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-xs sm:text-sm"
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