'use client'

import { useState, useEffect } from 'react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { EmptyState } from '@/components/admin/EmptyState'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CreditCard, CheckCircle, XCircle, Eye } from 'lucide-react'
import { PaymentsAdminService, PaymentListItem, PaymentInfo } from '@/lib/payments-admin'
import toast from 'react-hot-toast'

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('unpaid')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  // Payment info modal
  const [paymentInfoOpen, setPaymentInfoOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentInfo | null>(null)
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(false)

  // Approve dialog
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [approvingBookingId, setApprovingBookingId] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [page, paymentStatusFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await PaymentsAdminService.getPayments(
        paymentStatusFilter === 'all' ? undefined : (paymentStatusFilter as any),
        pageSize,
        (page - 1) * pageSize
      )
      setPayments(response.items)
      setTotal(response.total)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const handleViewPaymentInfo = async (bookingId: string) => {
    try {
      setLoadingPaymentInfo(true)
      setPaymentInfoOpen(true)
      const info = await PaymentsAdminService.getPaymentInfo(bookingId)
      setSelectedPayment(info)
    } catch (error) {
      console.error('Error fetching payment info:', error)
      toast.error('Failed to load payment information')
      setPaymentInfoOpen(false)
    } finally {
      setLoadingPaymentInfo(false)
    }
  }

  const handleApprovePayment = async () => {
    if (!approvingBookingId) return

    try {
      setApproving(true)
      await PaymentsAdminService.confirmPayment(approvingBookingId)
      toast.success('Payment approved successfully')
      setApproveDialogOpen(false)
      fetchPayments()
    } catch (error) {
      console.error('Error approving payment:', error)
      toast.error('Failed to approve payment')
    } finally {
      setApproving(false)
    }
  }

  const handleRejectPayment = async () => {
    if (!rejectingBookingId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      setRejecting(true)
      await PaymentsAdminService.rejectPayment(rejectingBookingId, rejectReason)
      toast.success('Payment rejected')
      setRejectDialogOpen(false)
      setRejectReason('')
      fetchPayments()
    } catch (error) {
      console.error('Error rejecting payment:', error)
      toast.error('Failed to reject payment')
    } finally {
      setRejecting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<PaymentListItem>[] = [
    {
      key: 'booking_id',
      label: 'Booking ID',
      sortable: true,
      width: '140px',
      minWidth: '140px',
      render: (payment) => (
        <span className="font-mono text-xs">{payment.booking_id?.slice(0, 8) || 'N/A'}</span>
      ),
    },
    {
      key: 'user_name',
      label: 'User',
      sortable: true,
      width: '200px',
      minWidth: '180px',
      render: (payment) => (
        <div>
          <p className="font-medium text-sm">{payment.user_name || 'N/A'}</p>
          <p className="text-xs text-gray-500 truncate">{payment.user_email}</p>
        </div>
      ),
    },
    {
      key: 'destination_name',
      label: 'Destination',
      sortable: true,
      width: '180px',
      minWidth: '150px',
      className: 'max-w-0',
      render: (payment) => (
        <span className="truncate block" title={payment.destination_name}>
          {payment.destination_name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      width: '120px',
      minWidth: '100px',
      render: (payment) => (
        <span className="font-medium">{formatCurrency(payment.amount)}</span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      width: '100px',
      minWidth: '100px',
      render: (payment) => (
        <StatusBadge status={payment.payment_status} type="payment" />
      ),
    },
    {
      key: 'payment_date',
      label: 'Payment Date',
      width: '130px',
      minWidth: '120px',
      render: (payment) => (
        <span className="text-sm">{formatDate(payment.payment_date)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '280px',
      minWidth: '280px',
      render: (payment) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => payment.booking_id && handleViewPaymentInfo(payment.booking_id)}
            disabled={!payment.booking_id}
            className="text-xs px-2 py-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {payment.payment_status === 'unpaid' && payment.booking_id && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                onClick={() => {
                  setApprovingBookingId(payment.booking_id)
                  setApproveDialogOpen(true)
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="text-xs px-2 py-1"
                onClick={() => {
                  setRejectingBookingId(payment.booking_id)
                  setRejectDialogOpen(true)
                }}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject
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
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-1">Review and approve payments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Label>Payment Status:</Label>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
        keyExtractor={(payment) => payment.booking_id}
        emptyState={
          <EmptyState
            icon={CreditCard}
            title="No payments found"
            description="There are no payments matching your filters."
          />
        }
      />

      {/* Payment Info Modal */}
      <Dialog open={paymentInfoOpen} onOpenChange={setPaymentInfoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Information</DialogTitle>
            <DialogDescription>
              Detailed payment information for this booking
            </DialogDescription>
          </DialogHeader>
          {loadingPaymentInfo ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
            </div>
          ) : selectedPayment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Booking ID</Label>
                  <p className="font-mono text-sm">{selectedPayment.booking_id}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label>Payer Name</Label>
                  <p>{selectedPayment.payer_name}</p>
                </div>
                <div>
                  <Label>Payer Email</Label>
                  <p>{selectedPayment.payer_email}</p>
                </div>
                {selectedPayment.payment_method && (
                  <div>
                    <Label>Payment Method</Label>
                    <p>{selectedPayment.payment_method}</p>
                  </div>
                )}
                {selectedPayment.transaction_id && (
                  <div>
                    <Label>Transaction ID</Label>
                    <p className="font-mono text-sm">{selectedPayment.transaction_id}</p>
                  </div>
                )}
                {selectedPayment.payment_date && (
                  <div>
                    <Label>Payment Date</Label>
                    <p>{formatDate(selectedPayment.payment_date)}</p>
                  </div>
                )}
              </div>
              {selectedPayment.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-700">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No payment information available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Payment"
        description="Are you sure you want to approve this payment? The booking will be confirmed."
        confirmText="Approve Payment"
        onConfirm={handleApprovePayment}
        loading={approving}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false)
                  setRejectReason('')
                }}
                disabled={rejecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectPayment}
                disabled={rejecting || !rejectReason.trim()}
              >
                {rejecting ? 'Rejecting...' : 'Reject Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
