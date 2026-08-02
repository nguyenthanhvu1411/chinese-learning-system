import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-[var(--cream)] lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link className="mb-12 flex items-center gap-3 font-semibold" href="/">
            <span className="grid size-10 place-items-center rounded-2xl bg-[var(--red)] text-xl text-white">汉</span>
            Hán Ngữ Mỗi Ngày
          </Link>
          {children}
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[var(--ink)] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-[var(--red)]/25 blur-3xl" />
        <p className="relative text-sm uppercase tracking-[0.2em] text-[var(--gold)]">Mỗi ngày một bước nhỏ</p>
        <div className="relative">
          <p className="font-serif text-8xl">学</p>
          <blockquote className="mt-8 max-w-lg text-4xl font-medium leading-tight tracking-tight">
            Học một ngôn ngữ là có thêm một cách để nhìn thế giới.
          </blockquote>
          <p className="mt-6 text-white/55">坚持就是胜利 · Kiên trì sẽ tạo nên thành công.</p>
        </div>
      </aside>
    </main>
  );
}
