export interface JobApplication {
  id: string
  company: string
  position: string
  location?: string
  salary?: string
  status: ApplicationStatus
  appliedDate: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ApplicationStatus = 
  | 'APPLIED'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ACCEPTED'

export interface CreateJobApplicationData {
  company: string
  position: string
  location?: string
  salary?: string
  status?: ApplicationStatus
  appliedDate: Date
  notes?: string
}

export interface UpdateJobApplicationData {
  company?: string
  position?: string
  location?: string
  salary?: string
  status?: ApplicationStatus
  appliedDate?: Date
  notes?: string
} 