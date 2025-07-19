# Clerk Authentication Setup Guide

This application now uses Clerk for user authentication. Follow these steps to set up your Clerk account and configure the application.

## 1. Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Get Your API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy your keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## 3. Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Clerk Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Optional: Redirect URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database (if not already set)
DATABASE_URL="file:./dev.db"
```

## 4. Run the Application

```bash
npm run dev
```

## 5. Test Authentication

1. Visit `http://localhost:3000`
2. You should be redirected to the sign-in page
3. Create a new account or sign in
4. You'll be redirected back to the dashboard

## Features Added

- ✅ User authentication with Clerk
- ✅ Protected routes (redirects to sign-in if not authenticated)
- ✅ User-specific job applications (each user only sees their own data)
- ✅ User profile management with UserButton
- ✅ Automatic user creation in database on first sign-in
- ✅ Sign-in and sign-up pages with custom styling
- ✅ Database migrations with user relationships

## Security Features

- All API routes are protected and require authentication
- Users can only access their own job applications
- Automatic user provisioning from Clerk user data
- Secure session management handled by Clerk

## Troubleshooting

If you encounter issues:

1. Make sure your environment variables are correctly set
2. Check that your Clerk keys are valid
3. Ensure the database is properly migrated (`npx prisma migrate dev`)
4. Restart your development server after adding environment variables 