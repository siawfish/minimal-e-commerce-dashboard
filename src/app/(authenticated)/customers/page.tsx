"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreVertical, ArrowUpDown, Eye, Edit, Trash, Loader2, AlertCircle } from "lucide-react"
import { useCustomers, Customer } from "@/hooks/useCustomers"

export default function Customers() {
  const { customers, loading, error, refetch } = useCustomers()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortField, setSortField] = React.useState<keyof Customer | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  // Filter customers based on search query
  const filteredCustomers = React.useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [customers, searchQuery])

  // Sort customers
  const sortedCustomers = React.useMemo(() => {
    if (!sortField) return filteredCustomers

    return [...filteredCustomers].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredCustomers, sortField, sortDirection])

  // Paginate customers
  const paginatedCustomers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedCustomers.slice(startIndex, startIndex + pageSize)
  }, [sortedCustomers, currentPage, pageSize])

  const totalPages = Math.ceil(sortedCustomers.length / pageSize)

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: Customer["status"]) => {
    const variants = {
      Active: "default",
      Inactive: "secondary", 
      Pending: "outline",
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status}
      </Badge>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-full">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">Customers</h1>
              <p className="text-zinc-500 mt-1">Manage your customer relationships</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                <p className="text-zinc-500">Loading customers...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-full">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">Customers</h1>
              <p className="text-zinc-500 mt-1">Manage your customer relationships</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="text-center">
                  <p className="text-zinc-900 font-medium">Failed to load customers</p>
                  <p className="text-zinc-500 text-sm">{error}</p>
                  <Button onClick={refetch} variant="outline" className="mt-4">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Customers</h1>
            <p className="text-zinc-500 mt-1">Manage your customer relationships</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customer Directory</span>
              <span className="text-sm font-normal text-zinc-500">
                {sortedCustomers.length} customers
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {paginatedCustomers.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-zinc-500">No customers found</p>
                  {searchQuery && (
                    <p className="text-zinc-400 text-sm mt-1">
                      Try adjusting your search query
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Customer
                          <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => handleSort("orders")}
                      >
                        <div className="flex items-center gap-2">
                          Orders
                          <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => handleSort("totalSpent")}
                      >
                        <div className="flex items-center gap-2">
                          Total Spent
                          <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => handleSort("joinedAt")}
                      >
                        <div className="flex items-center gap-2">
                          Joined
                          <ArrowUpDown className="h-3 w-3 text-zinc-400" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-zinc-50 transition-colors">
                        <TableCell>
                          <div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-zinc-900">{customer.name}</p>
                            <p className="text-sm text-zinc-500">{customer.email}</p>
                            {customer.phone && (
                              <p className="text-xs text-zinc-400">{customer.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="font-medium text-zinc-900">{customer.orders}</p>
                            <p className="text-xs text-zinc-500">orders</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="font-medium text-zinc-900">₵{customer.totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-zinc-500">lifetime value</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="font-medium text-zinc-900">
                              {new Date(customer.joinedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-zinc-500">member since</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(customer.status)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {paginatedCustomers.length > 0 && (
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <p>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedCustomers.length)} of {sortedCustomers.length} customers
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center gap-1">
                <span>Page {currentPage} of {totalPages}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 