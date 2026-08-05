import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HANYU - Modern Chinese Learning",
  description: "Learn Chinese characters, vocabulary, and grammar efficiently.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-ink-100 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <Link href="/" className="font-serif text-2xl font-bold text-primary-600 tracking-tight">
                    汉语 <span className="font-sans text-xl text-ink-900 tracking-normal ml-2">HANYU</span>
                  </Link>
                  <nav className="hidden md:flex gap-6">
                    <Link href="/dictionary" className="text-ink-600 hover:text-primary-600 font-medium transition-colors">
                      Dictionary
                    </Link>
                    <Link href="/lessons" className="text-ink-600 hover:text-primary-600 font-medium transition-colors">
                      Lessons
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-ink-600 hover:text-primary-600 font-medium transition-colors">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary py-2 px-4 text-sm hidden sm:inline-flex">
                    Start Learning
                  </Link>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>

          <footer className="bg-white border-t border-ink-100 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-ink-500">
              <p>&copy; {new Date().getFullYear()} HANYU. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
