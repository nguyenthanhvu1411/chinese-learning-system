"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard, Message } from "../../../components/auth-card";
import { fetchCurrentUser, signIn } from "../../../lib/supabase-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const session = await signIn(email, password);
      await fetchCurrentUser(session.access_token);
      setMessage("Đăng nhập thành công. Access token đã được backend staging xác thực.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Đăng nhập"
      description="Tiếp tục lộ trình HSK 1 của bạn."
      footer={<p>Chưa có tài khoản? <Link href="/auth/register">Đăng ký</Link></p>}
    >
      <form className="auth-form" onSubmit={submit}>
        <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Mật khẩu<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <div className="form-row"><Link href="/auth/forgot-password">Quên mật khẩu?</Link></div>
        <button disabled={loading} type="submit">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      </form>
      {error ? <Message type="error">{error}</Message> : null}
      {message ? <Message type="success">{message}</Message> : null}
    </AuthCard>
  );
}
