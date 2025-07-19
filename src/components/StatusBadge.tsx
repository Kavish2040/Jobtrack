import { ApplicationStatus } from '@/types'

interface StatusBadgeProps {
  status: ApplicationStatus
}

const statusConfig = {
  APPLIED: { label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INTERVIEWING: { label: 'Interviewing', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  OFFERED: { label: 'Offered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200' }
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  )
} 