import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrCreateUser } from '@/lib/user'
import { CreateJobApplicationData } from '@/types'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await getOrCreateUser(userId)

    const applications = await prisma.jobApplication.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateJobApplicationData = await request.json()
    
    // Get or create user (this handles first-time users)
    const user = await getOrCreateUser(userId)
    
    const application = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        company: body.company,
        position: body.position,
        location: body.location,
        salary: body.salary,
        status: body.status || 'APPLIED',
        appliedDate: new Date(body.appliedDate),
        notes: body.notes
      }
    })
    
    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating job application:', error)
    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500 }
    )
  }
} 