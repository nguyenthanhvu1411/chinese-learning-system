"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

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
          <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </body>
      </html>
    );
  }

  if (isLoginPage) {
    return (
      <html lang="vi">
        <title>HANYU Admin Panel</title>
        <body>{children}</body>
      </html>
    );
  }

  const navItems = [
    { name: "Tổng quan", path: "/", icon: "LayoutDashboard" },
    { name: "Từ vựng", path: "/vocabularies", icon: "BookOpen" },
    { name: "Bài học", path: "/lessons", icon: "GraduationCap" }
  ];

  return (
    <html lang="vi">
      <title>HANYU Admin Panel</title>
      <body className="flex h-screen overflow-hidden bg-[#FAF7F2] text-slate-800 selection:bg-primary-100 selection:text-primary-900">
        {/* Sidebar */}
        <div className="w-64 flex flex-col relative z-20 shrink-0">
          {/* Background Illustration for Sidebar */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-2/3 opacity-80 mix-blend-multiply">
              <Image 
                src="/images/admin/sidebar-bg.png" 
                alt="Sidebar background" 
                fill 
                className="object-cover object-bottom"
                priority
              />
            </div>
            {/* Fade out top */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-transparent to-[#FAF7F2] z-10" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="h-24 flex items-center px-8">
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                  <span className="text-white text-xl leading-none">漢</span>
                </div>
                HANYU <span className="text-primary-600 font-medium">Admin</span>
              </span>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4 px-5">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
                  return (
                    <li key={item.path}>
                      <Link 
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-all ${
                          isActive 
                            ? "bg-[#FCF7F7] text-primary-700 border-l-4 border-primary-600" 
                            : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-900 border-l-4 border-transparent"
                        }`}
                      >
                        {item.icon === "LayoutDashboard" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        {item.icon === "BookOpen" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                        {item.icon === "GraduationCap" && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-[#FAF7F2]">
          <main className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
