'use client'

import { useState, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { JobApplication } from '@/types'
import Dashboard from '@/components/Dashboard'
import JobApplicationCard from '@/components/JobApplicationCard'
import JobApplicationForm from '@/components/JobApplicationForm'
import { Plus, Search, Filter, FileText } from 'lucide-react'

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchApplications()
    } else if (isLoaded && !isSignedIn) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/job-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddApplication = async (formData: any) => {
    try {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchApplications()
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding application:', error)
    }
  }

  const handleUpdateApplication = async (formData: any) => {
    if (!editingApplication) return

    try {
      const response = await fetch(`/api/job-applications/${editingApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchApplications()
        setEditingApplication(null)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const response = await fetch(`/api/job-applications/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchApplications()
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingApplication(null)
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Show loading state while Clerk is initializing
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not signed in, Clerk middleware will redirect to sign-in page
  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Application Tracker</h1>
            <p className="text-slate-600">Welcome back, {user?.firstName || 'there'}! Manage and track your job search progress</p>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        {/* Dashboard */}
        <div className="mb-8">
          <Dashboard applications={applications} />
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFERED">Offered</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="ACCEPTED">Accepted</option>
              </select>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </button>
        </div>

        {/* Form Modal */}
        {(showForm || editingApplication) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">
                {editingApplication ? 'Edit Application' : 'Add New Application'}
              </h2>
              <JobApplicationForm
                application={editingApplication || undefined}
                onSubmit={editingApplication ? handleUpdateApplication : handleAddApplication}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-300 mb-4">
              <FileText className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-600 text-sm">
              {applications.length === 0 
                ? "Get started by adding your first job application."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <JobApplicationCard
                key={application.id}
                application={application}
                onEdit={handleEdit}
                onDelete={handleDeleteApplication}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
