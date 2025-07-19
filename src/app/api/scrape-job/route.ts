import { NextRequest, NextResponse } from 'next/server'
import { scrapeJobFromUrl } from '@/lib/jobScraper'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Scrape job data from the URL
    const jobData = await scrapeJobFromUrl(url)

    return NextResponse.json(jobData)
  } catch (error) {
    console.error('Error in scrape-job API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape job data' },
      { status: 500 }
    )
  }
} 