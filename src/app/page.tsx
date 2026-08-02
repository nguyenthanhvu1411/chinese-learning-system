import Link from "next/link";

const features = [
  {
    icon: "字",
    title: "Từ vựng theo chủ đề",
    description: "Học chữ Hán, pinyin và nghĩa tiếng Việt theo lộ trình rõ ràng.",
  },
  {
    icon: "声",
    title: "Luyện nghe và phát âm",
    description: "Nghe mẫu, luyện thanh điệu và cải thiện phát âm từng ngày.",
  },
  {
    icon: "聊",
    title: "Hội thoại cùng AI",
    description: "Thực hành tình huống thực tế và nhận góp ý ngay sau mỗi câu.",
  },
];

const roadmap = ["Làm quen", "HSK 1", "HSK 2", "Giao tiếp"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--cream)] text-[var(--ink)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold tracking-tight" href="/">
          <span className="grid size-10 place-items-center rounded-2xl bg-[var(--red)] text-xl text-white shadow-[0_8px_24px_rgba(184,49,45,0.22)]">
            汉
          </span>
          <span>Hán Ngữ Mỗi Ngày</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
          <a className="transition-colors hover:text-[var(--ink)]" href="#lo-trinh">Lộ trình</a>
          <a className="transition-colors hover:text-[var(--ink)]" href="#tinh-nang">Tính năng</a>
          <a className="transition-colors hover:text-[var(--ink)]" href="#gioi-thieu">Giới thiệu</a>
        </div>
        <Link className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--red)] hover:text-[var(--red)]" href="/login">
          Đăng nhập
        </Link>
      </nav>

      <section className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-20">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--red)]">
            <span className="size-1.5 rounded-full bg-[var(--red)]" />
            Học đều mỗi ngày
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Tiếng Trung trở nên
            <span className="font-serif italic text-[var(--red)]"> gần gũi</span> hơn.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Một lộ trình học cá nhân hóa, kết hợp từ vựng, phát âm và hội thoại để bạn tự tin sử dụng tiếng Trung trong đời sống.
          </p>
          <div id="bat-dau" className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link className="rounded-full bg-[var(--red)] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_12px_30px_rgba(184,49,45,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--red-dark)]" href="/register">
              Bắt đầu học miễn phí
            </Link>
            <Link className="rounded-full border border-[var(--line)] bg-white/65 px-7 py-3.5 text-center text-sm font-semibold transition hover:bg-white" href="#tinh-nang">
              Khám phá phương pháp →
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--muted)]">
            <span>✓ Học theo trình độ</span>
            <span>✓ Theo dõi tiến bộ</span>
            <span>✓ Phản hồi tức thì</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-16 -z-10 rounded-full bg-[var(--peach)]/60 blur-3xl" />
          <div className="rotate-2 rounded-[2.5rem] border border-white/80 bg-white/75 p-5 shadow-[0_30px_80px_rgba(76,54,41,0.14)] backdrop-blur">
            <div className="rounded-[2rem] bg-[var(--ink)] p-7 text-white">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Bài học hôm nay</span>
                <span>05 phút</span>
              </div>
              <div className="my-10 text-center">
                <p className="text-7xl font-medium">你好</p>
                <p className="mt-4 text-sm tracking-[0.24em] text-[var(--gold)]">NǏ HǍO</p>
                <p className="mt-2 text-white/70">Xin chào</p>
              </div>
              <div className="flex items-center gap-3">
                <button aria-label="Nghe phát âm" className="grid size-12 place-items-center rounded-full bg-[var(--red)] text-lg">▶</button>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full w-2/3 rounded-full bg-[var(--gold)]" />
                </div>
                <span className="text-xs text-white/50">0:03</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 px-2 pb-2 pt-5 text-center">
              <div><strong className="block text-lg">12</strong><span className="text-xs text-[var(--muted)]">Từ mới</span></div>
              <div><strong className="block text-lg">80%</strong><span className="text-xs text-[var(--muted)]">Chính xác</span></div>
              <div><strong className="block text-lg">7</strong><span className="text-xs text-[var(--muted)]">Ngày liền</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="lo-trinh" className="border-y border-[var(--line)] bg-white/45">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <p className="mb-7 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Lộ trình từ nền tảng đến giao tiếp</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {roadmap.map((item, index) => (
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white/70 p-4" key={item}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--peach)] text-sm font-semibold text-[var(--red)]">{index + 1}</span>
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tinh-nang" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--red)]">Phương pháp học toàn diện</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">Mỗi kỹ năng đều có chỗ để tiến bộ.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article className="rounded-3xl border border-[var(--line)] bg-white/65 p-7 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(76,54,41,0.08)]" key={feature.title}>
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--peach)] text-xl text-[var(--red)]">{feature.icon}</span>
              <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-[var(--muted)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer id="gioi-thieu" className="border-t border-[var(--line)] px-6 py-8 text-center text-sm text-[var(--muted)]">
        Hán Ngữ Mỗi Ngày · Xây dựng thói quen, mở rộng thế giới.
      </footer>
    </main>
  );
}
