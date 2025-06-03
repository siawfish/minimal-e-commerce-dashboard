"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Eye, 
  MoreVertical, 
  CreditCard, 
  User, 
  Calendar, 
  DollarSign, 
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { useTransactions, Transaction } from "@/hooks/useTransactions"
import { 
  formatTransactionId, 
  getStatusColor, 
  formatCurrency,
  cancelTransaction,
  completeTransaction 
} from "@/lib/transactions"
import { useToast } from "@/components/ui/toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Actions component with proper hooks usage
function TransactionActions({ transaction }: { transaction: Transaction }) {
  const { showToast } = useToast()

  const handleStatusUpdate = async (newStatus: Transaction['status']) => {
    try {
      if (newStatus === 'completed') {
        await completeTransaction(transaction.id)
        showToast(`Transaction ${formatTransactionId(transaction.id)} has been marked as completed.`, 'success')
      } else if (newStatus === 'cancelled') {
        await cancelTransaction(transaction.id)
        showToast(`Transaction ${formatTransactionId(transaction.id)} has been cancelled.`, 'success')
      }
    } catch {
      showToast('Failed to update transaction status.', 'error')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {transaction.status === 'pending' && (
          <DropdownMenuItem onClick={() => handleStatusUpdate('completed')}>
            Complete Transaction
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          Download Receipt
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {transaction.status !== 'cancelled' && (
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => handleStatusUpdate('cancelled')}
          >
            Cancel Transaction
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Mobile Transaction Card Component
function MobileTransactionCard({ transaction }: { transaction: Transaction }) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-zinc-400" />
          <span className="font-mono text-sm font-medium">
            {formatTransactionId(transaction.id)}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(transaction.status)}`}
        >
          {transaction.status.toUpperCase()}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-zinc-400" />
        <div>
          <div className="font-medium text-sm">{transaction.customerName}</div>
          <div className="text-xs text-zinc-500">{transaction.customerEmail}</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm font-medium">Products:</div>
        {transaction.products.slice(0, 2).map((product, index) => (
          <div key={index} className="text-sm text-zinc-600">
            {product.quantity}x {product.productName}
            {product.size && <span className="text-zinc-500"> ({product.size})</span>}
          </div>
        ))}
        {transaction.products.length > 2 && (
          <div className="text-xs text-zinc-500">
            +{transaction.products.length - 2} more items
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-zinc-400" />
          <span className="font-semibold">
            {formatCurrency(transaction.total, transaction.currency)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-zinc-400" />
          <span className="text-xs text-zinc-500">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <TransactionActions transaction={transaction} />
      </div>
    </div>
  )
}

const columns: ColumnDef<Transaction>[] = [
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
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-zinc-400" />
        <div>
          <span className="font-mono text-sm font-medium">
            {formatTransactionId(row.original.id)}
          </span>
          {row.original.reference && (
            <div className="text-xs text-zinc-500">
              Ref: {row.original.reference}
            </div>
          )}
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-zinc-400" />
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-xs text-zinc-500">{row.original.customerEmail}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => (
      <div className="max-w-xs">
        <div className="text-sm">
          {row.original.products.slice(0, 2).map((product, index) => (
            <div key={index} className="flex justify-between">
              <span className="truncate">
                {product.quantity}x {product.productName}
                {product.size && <span className="text-zinc-500"> ({product.size})</span>}
              </span>
            </div>
          ))}
          {row.original.products.length > 2 && (
            <div className="text-xs text-zinc-500">
              +{row.original.products.length - 2} more items
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <DollarSign className="h-3 w-3 text-zinc-400" />
        <span className="font-semibold">
          {formatCurrency(row.original.total, row.original.currency)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(row.original.status)}`}
      >
        {row.original.status.toUpperCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-zinc-400" />
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <TransactionActions transaction={row.original} />,
  },
]

export default function Transactions() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isMobile, setIsMobile] = React.useState(false)

  const { transactions, loading, error, refetch } = useTransactions()
  const { ToastComponent } = useToast()

  // Initialize responsive state on client side
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setColumnVisibility({
        products: window.innerWidth > 768,
        createdAt: window.innerWidth > 1024,
      })
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (error) {
    return (
      <div className="min-h-full p-4 sm:p-6">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions</h1>
                <p className="text-sm sm:text-base text-zinc-500">
                  Manage and track all customer transactions
                </p>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
        {ToastComponent}
      </div>
    )
  }

  return (
    <div className="min-h-full p-4 sm:p-6">
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions</h1>
              <p className="text-sm sm:text-base text-zinc-500">
                Manage and track all customer transactions
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("customerName")?.setFilterValue(event.target.value)
              }
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" && column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Filter className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {isMobile ? (
          // Mobile Card View
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading transactions...</span>
                </div>
              </div>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <MobileTransactionCard key={row.id} transaction={row.original} />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-zinc-500">No transactions found.</p>
              </div>
            )}
          </div>
        ) : (
          // Desktop Table View
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="whitespace-nowrap">
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Loading transactions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <p className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {ToastComponent}
    </div>
  )
} 