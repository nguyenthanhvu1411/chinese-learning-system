import Link from "next/link";

export const metadata = {
  title: "Register - HANYU",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card animate-slide-up">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-ink-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-ink-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Log in
            </Link>
          </p>
        </div>
        
        {/* Placeholder form for UI MVP */}
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="sr-only">First Name</label>
                <input 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  required 
                  className="input-field" 
                  placeholder="First Name" 
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="sr-only">Last Name</label>
                <input 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  required 
                  className="input-field" 
                  placeholder="Last Name" 
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input 
                id="email-address" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                className="input-field" 
                placeholder="Email address" 
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="input-field" 
                placeholder="Password" 
              />
              <p className="mt-1 text-xs text-ink-500">Must be at least 8 characters with 1 number, 1 uppercase, and 1 lowercase letter.</p>
            </div>
          </div>

          <div>
            <button type="submit" className="btn-primary w-full text-lg">
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
