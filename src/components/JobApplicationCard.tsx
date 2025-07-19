'use client'

import { JobApplication } from '@/types'
import StatusBadge from './StatusBadge'
import { format } from 'date-fns'
import { Edit3, Trash2, Calendar, MapPin, DollarSign, Building2 } from 'lucide-react'

interface JobApplicationCardProps {
  application: JobApplication
  onEdit: (application: JobApplication) => void
  onDelete: (id: string) => void
}

export default function JobApplicationCard({ application, onEdit, onDelete }: JobApplicationCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{application.position}</h3>
          <div className="flex items-center text-slate-600 font-medium">
            <Building2 className="w-4 h-4 mr-2 text-slate-400" />
            {application.company}
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="space-y-3 mb-4">
        {application.location && (
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-2 text-slate-400" />
            {application.location}
          </div>
        )}
        
        {application.salary && (
          <div className="flex items-center text-sm text-slate-600">
            <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
            {application.salary}
          </div>
        )}
        
        <div className="flex items-center text-sm text-slate-600">
          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
          Applied: {format(new Date(application.appliedDate), 'MMM dd, yyyy')}
        </div>
      </div>

      {application.notes && (
        <div className="mb-4">
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
            {application.notes}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-1">
        <button
          onClick={() => onEdit(application)}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="Edit application"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(application.id)}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete application"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
} 