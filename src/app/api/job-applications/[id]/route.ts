import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrCreateUser } from '@/lib/user'
import { UpdateJobApplicationData } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get user from database
    const user = await getOrCreateUser(userId)

    const application = await prisma.jobApplication.findFirst({
      where: { 
        id,
        userId: user.id // Ensure user can only access their own applications
      }
    })
    
    if (!application) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching job application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job application' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body: UpdateJobApplicationData = await request.json()

    // Get user from database
    const user = await getOrCreateUser(userId)
    
    const application = await prisma.jobApplication.updateMany({
      where: { 
        id,
        userId: user.id // Ensure user can only update their own applications
      },
      data: {
        company: body.company,
        position: body.position,
        location: body.location,
        salary: body.salary,
        status: body.status,
        appliedDate: body.appliedDate ? new Date(body.appliedDate) : undefined,
        notes: body.notes
      }
    })

    if (application.count === 0) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      )
    }

    // Fetch the updated application
    const updatedApplication = await prisma.jobApplication.findUnique({
      where: { id }
    })
    
    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating job application:', error)
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get user from database
    const user = await getOrCreateUser(userId)

    const result = await prisma.jobApplication.deleteMany({
      where: { 
        id,
        userId: user.id // Ensure user can only delete their own applications
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Job application deleted successfully' })
  } catch (error) {
    console.error('Error deleting job application:', error)
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    )
  }
} 