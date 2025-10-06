'use client'

import { useState, useEffect } from 'react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Users as UsersIcon, Eye, UserX, UserCheck, Trash2 } from 'lucide-react'
import { UsersAdminService, UserListItem } from '@/lib/users-admin'
import { BookingsAdminService } from '@/lib/bookings-admin'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  // User bookings modal
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  // Deactivate dialog
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [deactivatingUserId, setDeactivatingUserId] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await UsersAdminService.getUsers(search, pageSize, (page - 1) * pageSize)
      setUsers(response.items)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleViewBookings = async (userId: string) => {
    try {
      setSelectedUserId(userId)
      setBookingsModalOpen(true)
      setLoadingBookings(true)
      const bookings = await BookingsAdminService.getBookingsByUser(userId)
      setUserBookings(bookings)
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      toast.error('Failed to load user bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleDeactivateUser = async () => {
    if (!deactivatingUserId) return

    try {
      setDeactivating(true)
      await UsersAdminService.deactivateUser(deactivatingUserId)
      toast.success('User deactivated successfully')
      setDeactivateDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Error deactivating user:', error)
      toast.error('Failed to deactivate user')
    } finally {
      setDeactivating(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUserId) return

    try {
      setDeleting(true)
      await UsersAdminService.deleteUser(deletingUserId)
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      user.id.toLowerCase().includes(searchLower) ||
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const columns: Column<UserListItem>[] = [
    {
      key: 'id',
      label: 'User ID',
      sortable: true,
      render: (user) => <span className="font-mono text-xs">{user.id?.slice(0, 8) || 'N/A'}</span>,
    },
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (user) => (
        <div>
          <p className="font-medium">{user.full_name}</p>
          {user.is_admin && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Admin
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (user) => user.phone || 'N/A',
    },
    {
      key: 'created_at',
      label: 'Registered',
      sortable: true,
      render: (user) => formatDate(user.created_at),
    },
    {
      key: 'total_bookings',
      label: 'Bookings',
      sortable: true,
      render: (user) => user.total_bookings || 0,
    },
    {
      key: 'total_spent',
      label: 'Total Spent',
      sortable: true,
      render: (user) => formatCurrency(user.total_spent || 0),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewBookings(user.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!user.is_admin && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDeactivatingUserId(user.id)
                  setDeactivateDialogOpen(true)
                }}
              >
                <UserX className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setDeletingUserId(user.id)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">View and manage user accounts</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ID, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
        keyExtractor={(user) => user.id}
        emptyState={
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="There are no users matching your search."
          />
        }
      />

      {/* User Bookings Modal */}
      <Dialog open={bookingsModalOpen} onOpenChange={setBookingsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Bookings</DialogTitle>
            <DialogDescription>
              All bookings for this user
            </DialogDescription>
          </DialogHeader>
          {loadingBookings ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
            </div>
          ) : userBookings.length > 0 ? (
            <div className="space-y-4">
              {userBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{booking.destination_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Travel Date: {formatDate(booking.travel_date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Amount: {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.booking_status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.booking_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.booking_status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </div>
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No bookings found for this user</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        title="Deactivate User"
        description="Are you sure you want to deactivate this user? They will not be able to log in or make bookings."
        confirmText="Deactivate User"
        variant="destructive"
        onConfirm={handleDeactivateUser}
        loading={deactivating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone and will remove all user data including bookings."
        confirmText="Delete User"
        variant="destructive"
        onConfirm={handleDeleteUser}
        loading={deleting}
      />
    </div>
  )
}
