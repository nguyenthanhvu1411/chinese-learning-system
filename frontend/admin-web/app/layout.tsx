"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoginPage) {
      const token = localStorage.getItem("hanyu_admin_token");
      if (!token) {
        router.push("/login");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthorized(true);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    }
  }, [isLoginPage, router]);

  if (!isAuthorized) {
    return (
      <html lang="vi">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-bg-admin">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </body>
      </html>
    );
  }

  if (isLoginPage) {
    return (
      <html lang="vi">
        <title>HANYU Admin - Đăng nhập</title>
        <body>{children}</body>
      </html>
    );
  }

  const navItems = [
    { name: "Tổng quan", path: "/" },
    { name: "Từ vựng", path: "/vocabularies" },
    { name: "Bài học", path: "/lessons" },
    { name: "Thùng rác", path: "/trash" }
  ];

  return (
    <html lang="vi">
      <title>HANYU Admin Panel</title>
      <body className="flex h-screen overflow-hidden bg-bg-admin">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold tracking-tight text-white">
              HANYU <span className="text-primary-500">Admin</span>
            </span>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive 
                          ? "bg-primary-600 text-white" 
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                AD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <button 
                  onClick={() => {
                    localStorage.removeItem("hanyu_admin_token");
                    router.push("/login");
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-slate-800">
              {navItems.find(i => pathname === i.path || (i.path !== "/" && pathname.startsWith(i.path)))?.name || "Chi tiết"}
            </h1>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
