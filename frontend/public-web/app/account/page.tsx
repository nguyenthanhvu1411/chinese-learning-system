"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCurrentUser, loadSession, signOut } from "../../lib/supabase-auth";

export default function AccountPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = loadSession();
    if (!session?.access_token) {
      setError("Bạn chưa đăng nhập.");
      setLoading(false);
      return;
    }

    fetchCurrentUser(session.access_token)
      .then(setProfile)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải hồ sơ."))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await signOut();
    window.location.replace("/auth/login");
  }

  return (
    <main className="home-page">
      <section className="hero">
        <p className="brand">中文学习</p>
        <h1>Tài khoản học viên</h1>
        {loading ? <p>Đang kiểm tra phiên đăng nhập...</p> : null}
        {error ? <p className="message error">{error}</p> : null}
        {profile ? <pre className="message success">{JSON.stringify(profile, null, 2)}</pre> : null}
        <div className="actions">
          {profile ? <button className="button-link" onClick={logout}>Đăng xuất</button> : <Link className="button-link" href="/auth/login">Đăng nhập</Link>}
          <Link className="button-link secondary" href="/">Trang chủ</Link>
        </div>
      </section>
    </main>
  );
}
