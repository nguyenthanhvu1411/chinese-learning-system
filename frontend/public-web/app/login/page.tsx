import Link from "next/link";

export const metadata = {
  title: "Log in - HANYU",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card animate-slide-up">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-ink-900">
            Log in to HANYU
          </h2>
          <p className="mt-2 text-center text-sm text-ink-600">
            Or{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a free account
            </Link>
          </p>
        </div>
        
        {/* Placeholder form for UI MVP */}
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="rounded-md shadow-sm -space-y-px flex flex-col gap-4">
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
                autoComplete="current-password" 
                required 
                className="input-field" 
                placeholder="Password" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-ink-300 rounded" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-ink-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button type="submit" className="btn-primary w-full text-lg">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
