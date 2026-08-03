"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard, Message } from "../../../components/auth-card";
import { signUp } from "../../../lib/supabase-auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const result = await signUp(email, password, redirectTo);
      setMessage(
        result.session
          ? "Đăng ký thành công. Bạn có thể bắt đầu học."
          : "Đăng ký thành công. Hãy mở email để xác minh tài khoản.",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng ký.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Tạo tài khoản"
      description="Bắt đầu lộ trình học tiếng Trung dành cho người Việt."
      footer={<p>Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link></p>}
    >
      <form className="auth-form" onSubmit={submit}>
        <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Mật khẩu<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label>Xác nhận mật khẩu<input required minLength={6} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <button disabled={loading} type="submit">{loading ? "Đang tạo tài khoản..." : "Đăng ký"}</button>
      </form>
      {error ? <Message type="error">{error}</Message> : null}
      {message ? <Message type="success">{message}</Message> : null}
    </AuthCard>
  );
}
