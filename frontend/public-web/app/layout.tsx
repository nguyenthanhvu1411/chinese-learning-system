import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HANYU - Chinese Learning System",
  description: "Learn Chinese characters efficiently with spaced repetition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <div className="min-h-screen flex flex-col bg-bg-main text-ink-900">
          <header className="border-b border-ink-100 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600 tracking-tight">HANYU</span>
                    <span className="text-sm font-medium text-ink-500 bg-ink-50 px-2 py-0.5 rounded-full border border-ink-100 hidden sm:inline-block">
                      Beta
                    </span>
                  </Link>
                  <nav className="ml-10 hidden md:flex space-x-8">
                    <Link href="/vocabularies" className="text-ink-800 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      Từ vựng
                    </Link>
                    <Link href="/lessons" className="text-ink-800 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                      Bài học
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-ink-800 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                    Bắt đầu học
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-white border-t border-ink-100 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <p className="text-sm text-ink-500">
                  &copy; {new Date().getFullYear()} HANYU. All rights reserved.
                </p>
                <div className="flex space-x-6 text-sm text-ink-500">
                  <Link href="#" className="hover:text-ink-900 transition-colors">Về chúng tôi</Link>
                  <Link href="#" className="hover:text-ink-900 transition-colors">Bảo mật</Link>
                  <Link href="#" className="hover:text-ink-900 transition-colors">Điều khoản</Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
