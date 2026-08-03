"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthCard, Message } from "../../../components/auth-card";
import { readSessionFromUrl } from "../../../lib/supabase-auth";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Đang xử lý liên kết xác thực...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = readSessionFromUrl();
    const next = new URLSearchParams(window.location.search).get("next");

    if (!session) {
      setError("Liên kết không chứa phiên đăng nhập hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (next?.startsWith("/")) {
      window.location.replace(next);
      return;
    }

    setMessage("Xác minh thành công. Phiên đăng nhập đã được lưu.");
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  return (
    <AuthCard title="Xác thực tài khoản" description="Hoàn tất xác minh email hoặc khôi phục tài khoản." footer={<Link href="/auth/login">Đi đến đăng nhập</Link>}>
      {error ? <Message type="error">{error}</Message> : <Message type="success">{message}</Message>}
    </AuthCard>
  );
}
