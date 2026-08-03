import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <p className="brand">中文学习 · HSK 1</p>
        <h1>Học tiếng Trung theo lộ trình rõ ràng.</h1>
        <p>
          Bài học ngắn, giải thích bằng tiếng Việt, flashcard, quiz và lịch ôn tập dành cho người mới bắt đầu.
        </p>
        <div className="actions">
          <Link className="button-link" href="/auth/register">Bắt đầu học</Link>
          <Link className="button-link secondary" href="/auth/login">Đăng nhập</Link>
          <Link className="button-link secondary" href="/account">Kiểm tra tài khoản</Link>
        </div>
      </section>
    </main>
  );
}
