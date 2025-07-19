'use client'

import { JobApplication } from '@/types'
import { Building2, Clock, CheckCircle2, XCircle, TrendingUp, Award, FileText, Calendar, MapPin, DollarSign } from 'lucide-react'

interface DashboardProps {
  applications: JobApplication[]
}

export default function Dashboard({ applications }: DashboardProps) {
  const totalApplications = applications.length
  const applied = applications.filter(app => app.status === 'APPLIED').length
  const interviewing = applications.filter(app => app.status === 'INTERVIEWING').length
  const offered = applications.filter(app => app.status === 'OFFERED').length
  const accepted = applications.filter(app => app.status === 'ACCEPTED').length
  const rejected = applications.filter(app => app.status === 'REJECTED').length

  const successRate = totalApplications > 0 ? ((accepted / totalApplications) * 100).toFixed(1) : '0'

  const stats = [
    {
      label: 'Total Applications',
      value: totalApplications,
      icon: FileText,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50'
    },
    {
      label: 'Applied',
      value: applied,
      icon: Calendar,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Interviewing',
      value: interviewing,
      icon: TrendingUp,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Offered',
      value: offered,
      icon: Award,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Accepted',
      value: accepted,
      icon: CheckCircle2,
      color: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Rejected',
      value: rejected,
      icon: XCircle,
      color: 'text-red-700',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Application Overview</h2>
        <p className="text-slate-600 text-sm">Track your job search progress and success metrics</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-xs text-slate-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Success Rate</h3>
            <p className="text-sm text-slate-600">Applications resulting in acceptance</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-600">{successRate}%</div>
            <div className="text-xs text-slate-600 font-medium">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
} 