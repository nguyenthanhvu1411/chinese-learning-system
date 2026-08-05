import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "HANYU Admin",
  description: "Admin portal for HANYU Chinese Learning System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const isLoggedIn = !!token;

  return (
    <html lang="en">
      <body className="bg-bg-admin text-slate-900 min-h-screen flex">
        {isLoggedIn ? (
          <>
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-20">
              <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
                HANYU <span className="text-primary-500 ml-2">Admin</span>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                  <li>
                    <Link href="/" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/vocabularies" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
                      Vocabularies
                    </Link>
                  </li>
                  <li>
                    <Link href="/vocabularies/trash" className="block px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-400 text-sm">
                      Trash
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="p-4 border-t border-slate-800">
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="w-full text-left px-3 py-2 text-slate-400 hover:text-white transition-colors">
                    Log out
                  </button>
                </form>
              </div>
            </aside>
            <main className="flex-1 ml-64 p-8">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          </>
        ) : (
          <main className="flex-1 flex items-center justify-center p-4">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
