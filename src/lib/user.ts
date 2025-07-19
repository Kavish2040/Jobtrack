import { prisma } from './db'

export async function getOrCreateUser(clerkId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId }
  })
  
  if (!user) {
    // Create user with minimal data - will be updated later if needed
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `user-${clerkId}@temp.com`, // Temporary email
        firstName: null,
        lastName: null
      }
    })
  }
  
  return user
} 