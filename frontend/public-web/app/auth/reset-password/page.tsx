"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard, Message } from "../../../components/auth-card";
import { loadSession, updatePassword } from "../../../lib/supabase-auth";

export default function ResetPasswordPage() {
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

    const session = loadSession();
    if (!session?.access_token) {
      setError("Phiên đặt lại mật khẩu không tồn tại hoặc đã hết hạn.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password, session.access_token);
      setMessage("Đã cập nhật mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Đặt lại mật khẩu" description="Tạo mật khẩu mới cho tài khoản của bạn." footer={<Link href="/auth/login">Quay lại đăng nhập</Link>}>
      <form className="auth-form" onSubmit={submit}>
        <label>Mật khẩu mới<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <label>Xác nhận mật khẩu<input required minLength={6} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <button disabled={loading} type="submit">{loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</button>
      </form>
      {error ? <Message type="error">{error}</Message> : null}
      {message ? <Message type="success">{message}</Message> : null}
    </AuthCard>
  );
}
