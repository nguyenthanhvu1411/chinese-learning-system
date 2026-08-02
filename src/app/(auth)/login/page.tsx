import type { Metadata } from "next";

import { AuthForm } from "../auth-form";
import { login } from "../actions";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <>
      <p className="text-sm font-semibold text-[var(--red)]">Chào mừng trở lại</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Tiếp tục hành trình học.</h1>
      <p className="mt-3 text-[var(--muted)]">Đăng nhập để xem bài học và tiến độ của bạn.</p>
      <AuthForm action={login} mode="login" />
    </>
  );
}
