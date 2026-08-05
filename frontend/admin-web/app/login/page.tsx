import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { API_BASE_URL } from "../../lib/api";

export const metadata = {
  title: "Admin Login - HANYU",
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("accessToken")) {
    redirect("/");
  }

  // We are using a Server Action here for form submission
  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials or unauthorized");
      }

      const data = await response.json();
      
      const cookiesStore = await cookies();
      cookiesStore.set("accessToken", data.accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: data.expiresIn
      });
      cookiesStore.set("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });
      
    } catch (e) {
      console.error(e);
      throw e;
    }
    
    redirect("/");
  }

  return (
    <div className="w-full max-w-md admin-panel p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">HANYU Admin</h1>
        <p className="text-slate-500 mt-2">Sign in to manage content</p>
      </div>

      <form action={login} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            name="email" 
            required 
            defaultValue="admin@hanyu.com"
            className="input-field" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            name="password" 
            required 
            defaultValue="Password123!"
            className="input-field" 
          />
        </div>

        <button type="submit" className="btn-primary w-full py-2.5">
          Sign In
        </button>
      </form>
    </div>
  );
}
