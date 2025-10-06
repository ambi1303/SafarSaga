interface StatusBadgeProps {
  status: string
  type: 'booking' | 'payment'
}

const bookingStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors = {
  unpaid: 'bg-gray-100 text-gray-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-blue-100 text-blue-800',
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const colors = type === 'booking' ? bookingStatusColors : paymentStatusColors
  const colorClass = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
