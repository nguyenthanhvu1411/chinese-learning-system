import type { Metadata } from "next";

import { AuthForm } from "../auth-form";
import { register } from "../actions";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  return (
    <>
      <p className="text-sm font-semibold text-[var(--red)]">Bắt đầu miễn phí</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Tạo tài khoản học.</h1>
      <p className="mt-3 text-[var(--muted)]">Thiết lập tài khoản trong chưa đầy một phút.</p>
      <AuthForm action={register} mode="register" />
    </>
  );
}
