"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }

      const data = await res.json();
      // Temporary: Save token to localStorage for MVP
      // In a real implementation, this should ideally be handled via HttpOnly cookies
      localStorage.setItem("hanyu_token", data.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bg-main">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-ink-900">
          Đăng nhập vào tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-ink-500">
          Hoặc{" "}
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
            đăng ký tài khoản mới miễn phí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-subtle border border-ink-100 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-500 text-danger-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-800">
                Địa chỉ Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-800">
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
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
                <label htmlFor="remember-me" className="ml-2 block text-sm text-ink-800">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary justify-center"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
