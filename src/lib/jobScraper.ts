import OpenAI from 'openai'
import * as cheerio from 'cheerio'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface ScrapedJobData {
  company: string
  position: string
  location?: string
  salary?: string
  status: 'APPLIED'
  appliedDate: string
  notes?: string
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<string> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        redirect: 'follow',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error('Failed to fetch after retries')
}

function extractTextFromHtml(html: string): {
  title: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  cleanText: string
  structuredData: any[]
} {
  const $ = cheerio.load(html)
  
  // Extract meta information
  const title = $('title').text().trim()
  const metaDescription = $('meta[name="description"]').attr('content') || ''
  const ogTitle = $('meta[property="og:title"]').attr('content') || ''
  const ogDescription = $('meta[property="og:description"]').attr('content') || ''
  
  // Extract structured data (JSON-LD)
  const structuredData: any[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      structuredData.push(data)
    } catch (e) {
      // Ignore invalid JSON
    }
  })

  // Remove unwanted elements
  $('script, style, nav, footer, header, aside, .nav, .footer, .header, .sidebar, .advertisement, .ads').remove()
  
  // Focus on main content areas
  const contentSelectors = [
    'main',
    '[role="main"]',
    '.job-description',
    '.job-details',
    '.job-content',
    '.job-posting',
    '.position-description',
    '.job-summary',
    '.content',
    '.main-content',
    'article',
    '.post-content'
  ]
  
  let cleanText = ''
  for (const selector of contentSelectors) {
    const content = $(selector).first()
    if (content.length > 0) {
      cleanText = content.text().replace(/\s+/g, ' ').trim()
      break
    }
  }
  
  // Fallback to body if no main content found
  if (!cleanText) {
    cleanText = $('body').text().replace(/\s+/g, ' ').trim()
  }
  
  // Limit text length to avoid token limits
  cleanText = cleanText.substring(0, 10000)

  return {
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    cleanText,
    structuredData
  }
}

export async function scrapeJobFromUrl(url: string): Promise<ScrapedJobData> {
  try {
    console.log(`Scraping job data from: ${url}`)
    
    // Fetch the webpage content with retry logic
    const html = await fetchWithRetry(url)
    
    // Extract and clean the content
    const extracted = extractTextFromHtml(html)
    
    // Check for structured data first
    let jobStructuredData = null
    for (const data of extracted.structuredData) {
      if (data['@type'] === 'JobPosting' || (Array.isArray(data['@type']) && data['@type'].includes('JobPosting'))) {
        jobStructuredData = data
        break
      }
    }

    // Prepare content for AI analysis
    const analysisContent = `
URL: ${url}
Page Title: ${extracted.title}
Meta Description: ${extracted.metaDescription}
OG Title: ${extracted.ogTitle}
OG Description: ${extracted.ogDescription}

${jobStructuredData ? `Structured Job Data:
${JSON.stringify(jobStructuredData, null, 2)}

` : ''}Page Content:
${extracted.cleanText}
    `.trim()

    console.log('Sending content to OpenAI for analysis...')
    
    // Use OpenAI to parse the job information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional job posting analyzer. Extract job information from web page content and return it as a JSON object with this exact structure:

{
  "company": "Company name",
  "position": "Job title/position",
  "location": "Location (city, state/country or 'Remote')",
  "salary": "Salary range or compensation info",
  "notes": "Brief summary of key requirements, skills, or benefits"
}

IMPORTANT RULES:
- Return ONLY valid JSON, no additional text or formatting
- If a field cannot be determined, use null for that field
- For location: prefer "City, State" format or "Remote" for remote work
- For salary: include currency and range if available (e.g., "$80,000 - $100,000")
- For notes: summarize key requirements, skills, or benefits in 150 characters max
- Extract the most relevant and accurate information from the content
- If structured data is provided, prioritize it over text content`
        },
        {
          role: "user",
          content: analysisContent
        }
      ],
      temperature: 0.1,
      max_tokens: 600
    })

    const aiResponse = completion.choices[0]?.message?.content
    console.log('OpenAI response:', aiResponse)
    
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    // Parse the AI response
    let parsedData
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = aiResponse.trim()
      parsedData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse)
      console.error('Parse error:', parseError)
      throw new Error('Failed to parse job data from AI response')
    }

    // Validate and format the response
    const jobData: ScrapedJobData = {
      company: parsedData.company || 'Unknown Company',
      position: parsedData.position || 'Unknown Position',
      location: parsedData.location || undefined,
      salary: parsedData.salary || undefined,
      status: 'APPLIED' as const,
      appliedDate: new Date().toISOString().split('T')[0],
      notes: parsedData.notes || undefined
    }

    console.log('Successfully extracted job data:', jobData)
    return jobData

  } catch (error) {
    console.error('Error scraping job data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to scrape job data: ${errorMessage}`)
  }
} 