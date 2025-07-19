import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h1>
          <p className="text-slate-600">Create your Job Tracker account</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
} 