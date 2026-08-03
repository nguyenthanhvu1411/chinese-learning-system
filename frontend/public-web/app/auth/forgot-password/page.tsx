"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard, Message } from "../../../components/auth-card";
import { sendPasswordReset } from "../../../lib/supabase-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordReset(email, `${window.location.origin}/auth/callback?next=/auth/reset-password`);
      setMessage("Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư của bạn.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi email đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Quên mật khẩu" description="Nhập email để nhận liên kết đặt lại mật khẩu." footer={<Link href="/auth/login">Quay lại đăng nhập</Link>}>
      <form className="auth-form" onSubmit={submit}>
        <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <button disabled={loading} type="submit">{loading ? "Đang gửi..." : "Gửi email"}</button>
      </form>
      {error ? <Message type="error">{error}</Message> : null}
      {message ? <Message type="success">{message}</Message> : null}
    </AuthCard>
  );
}
