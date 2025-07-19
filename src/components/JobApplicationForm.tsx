'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { JobApplication, ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import { Building2, MapPin, DollarSign, Calendar, FileText, MessageSquare, Link, Download } from 'lucide-react'

const formSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN', 'ACCEPTED'] as const),
  appliedDate: z.string().min(1, 'Application date is required'),
  notes: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface JobApplicationFormProps {
  application?: JobApplication
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
}

export default function JobApplicationForm({ application, onSubmit, onCancel }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobUrl, setJobUrl] = useState('')
  const [isScrapingUrl, setIsScrapingUrl] = useState(false)
  const [scrapingError, setScrapingError] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: application?.company || '',
      position: application?.position || '',
      location: application?.location || '',
      salary: application?.salary || '',
      status: application?.status || 'APPLIED',
      appliedDate: application?.appliedDate ? format(new Date(application.appliedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      notes: application?.notes || ''
    }
  })

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUrlScrape = async () => {
    if (!jobUrl.trim()) {
      setScrapingError('Please enter a job URL')
      return
    }

    setIsScrapingUrl(true)
    setScrapingError('')

    try {
      const response = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: jobUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape job data')
      }

      // Populate form fields with scraped data
      setValue('company', data.company)
      setValue('position', data.position)
      setValue('location', data.location || '')
      setValue('salary', data.salary || '')
      setValue('notes', data.notes || '')
      setValue('appliedDate', data.appliedDate)

      setShowUrlInput(false)
      setJobUrl('')
    } catch (error) {
      console.error('Error scraping job URL:', error)
      setScrapingError(error instanceof Error ? error.message : 'Failed to scrape job data')
    } finally {
      setIsScrapingUrl(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* URL Scraping Section */}
      {!application && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-900">Quick Add from Job URL</h3>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showUrlInput ? 'Manual Entry' : 'Auto-fill from URL'}
            </button>
          </div>

          {showUrlInput && (
            <div className="space-y-3">
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-slate-700 mb-2">
                  <Link className="w-4 h-4 inline mr-2 text-slate-500" />
                  Job Posting URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="jobUrl"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://company.com/jobs/position"
                  />
                  <button
                    type="button"
                    onClick={handleUrlScrape}
                    disabled={isScrapingUrl}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isScrapingUrl ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Auto-fill
                      </>
                    )}
                  </button>
                </div>
              </div>

              {scrapingError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {scrapingError}
                </div>
              )}

              <div className="text-xs text-slate-600">
                Paste a job posting URL from LinkedIn, Indeed, company career pages, or other job boards. 
                We'll automatically extract the company, position, location, and other details.
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2 text-slate-500" />
              Company *
            </label>
            <input
              type="text"
              id="company"
              {...register('company')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter company name"
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2 text-slate-500" />
              Position *
            </label>
            <input
              type="text"
              id="position"
              {...register('position')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter position title"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-slate-500" />
              Location
            </label>
            <input
              type="text"
              id="location"
              {...register('location')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>

          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2 text-slate-500" />
              Salary Range
            </label>
            <input
              type="text"
              id="salary"
              {...register('salary')}
              placeholder="e.g., $80,000 - $100,000"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
              Status *
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFERED">Offered</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
          </div>

          <div>
            <label htmlFor="appliedDate" className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2 text-slate-500" />
              Application Date *
            </label>
            <input
              type="date"
              id="appliedDate"
              {...register('appliedDate')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.appliedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.appliedDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2 text-slate-500" />
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any additional notes, interview details, or follow-up actions..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Saving...' : application ? 'Update Application' : 'Add Application'}
          </button>
        </div>
      </form>
    </div>
  )
} 