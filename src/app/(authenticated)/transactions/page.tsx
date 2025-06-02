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
  Settings2
} from "lucide-react"
import { z } from "zod"

// Transaction schema for the data table
export const transactionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  products: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  total: z.number(),
  status: z.enum(["completed", "pending", "cancelled"]),
  createdAt: z.string(),
})

type Transaction = z.infer<typeof transactionSchema>

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200'
    default:
      return 'text-zinc-600 bg-zinc-50 border-zinc-200'
  }
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
        <span className="font-mono text-sm font-medium">{row.original.id}</span>
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
          <div className="text-xs text-zinc-500">{row.original.customerId}</div>
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
              <span className="truncate">{product.quantity}x {product.productName}</span>
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
        <span className="font-semibold">₵{row.original.total.toLocaleString()}</span>
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
    cell: () => (
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
          <DropdownMenuItem>
            Process Transaction
          </DropdownMenuItem>
          <DropdownMenuItem>
            Download Receipt
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            Cancel Transaction
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export default function Transactions() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const transactions: Transaction[] = [
    {
      id: "TXN001",
      customerId: "CUST001",
      customerName: "Olivia Martin",
      products: [
        { productId: "PROD001", productName: "YEEZY BOOST 350 V2", quantity: 1, price: 200 },
        { productId: "PROD002", productName: "YEEZY SLIDE", quantity: 2, price: 80 },
      ],
      total: 360,
      status: "completed" as const,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "TXN002", 
      customerId: "CUST002",
      customerName: "Jackson Lee",
      products: [
        { productId: "PROD003", productName: "YEEZY FOAM RUNNER", quantity: 1, price: 200 },
      ],
      total: 200,
      status: "pending" as const,
      createdAt: "2024-01-14T15:45:00Z",
    },
    {
      id: "TXN003",
      customerId: "CUST003", 
      customerName: "Isabella Nguyen",
      products: [
        { productId: "PROD004", productName: "YEEZY 700 V3", quantity: 1, price: 300 },
        { productId: "PROD005", productName: "YEEZY GAP HOODIE", quantity: 1, price: 90 },
      ],
      total: 390,
      status: "completed" as const,
      createdAt: "2024-01-13T09:20:00Z",
    },
    {
      id: "TXN004",
      customerId: "CUST004",
      customerName: "William Kim",
      products: [
        { productId: "PROD002", productName: "YEEZY SLIDE", quantity: 1, price: 80 },
      ],
      total: 80,
      status: "cancelled" as const,
      createdAt: "2024-01-12T14:15:00Z",
    },
    {
      id: "TXN005",
      customerId: "CUST005",
      customerName: "Sofia Davis", 
      products: [
        { productId: "PROD006", productName: "YEEZY NSLTD BT", quantity: 1, price: 180 },
      ],
      total: 180,
      status: "completed" as const,
      createdAt: "2024-01-11T11:00:00Z",
    },
  ]

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

  return (
    <div className="min-h-full">
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
              <p className="text-zinc-500">
                Manage and track all customer transactions
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 