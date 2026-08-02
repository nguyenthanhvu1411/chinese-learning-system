import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { logout } from "@/app/(auth)/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bảng điều khiển" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) redirect("/login");

  const name = typeof claims.user_metadata?.full_name === "string"
    ? claims.user_metadata.full_name
    : "Bạn";

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold">
            <span className="grid size-10 place-items-center rounded-2xl bg-[var(--red)] text-xl text-white">汉</span>
            Hán Ngữ Mỗi Ngày
          </div>
          <form action={logout}>
            <button className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold hover:border-[var(--red)] hover:text-[var(--red)]">
              Đăng xuất
            </button>
          </form>
        </nav>

        <section className="mt-16 rounded-[2rem] bg-[var(--ink)] p-8 text-white sm:p-12">
          <p className="text-sm text-[var(--gold)]">欢迎回来 · Chào mừng trở lại</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Xin chào, {name}!</h1>
          <p className="mt-4 max-w-xl leading-7 text-white/60">
            Tài khoản Supabase của bạn đã kết nối. Bài học và tiến độ cá nhân sẽ xuất hiện tại đây.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["0", "Bài đã hoàn thành"],
              ["0", "Từ đã học"],
              ["1", "Ngày liên tiếp"],
            ].map(([value, label]) => (
              <div className="rounded-2xl bg-white/8 p-5" key={label}>
                <strong className="text-3xl">{value}</strong>
                <p className="mt-1 text-sm text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
