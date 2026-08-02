"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthState } from "./actions";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({
  action,
  mode,
}: {
  action: AuthAction;
  mode: "login" | "register";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {!isLogin && (
        <label className="block text-sm font-medium">
          Họ và tên
          <input
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--red)] focus:ring-4 focus:ring-[var(--peach)]"
            name="fullName"
            placeholder="Nguyễn Thanh Vũ"
            required
          />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--red)] focus:ring-4 focus:ring-[var(--peach)]"
          name="email"
          placeholder="ban@example.com"
          required
          type="email"
        />
      </label>
      <label className="block text-sm font-medium">
        Mật khẩu
        <input
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--red)] focus:ring-4 focus:ring-[var(--peach)]"
          minLength={6}
          name="password"
          placeholder="Ít nhất 6 ký tự"
          required
          type="password"
        />
      </label>

      {state.error && (
        <p aria-live="polite" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p aria-live="polite" className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        className="w-full rounded-full bg-[var(--red)] px-6 py-3.5 font-semibold text-white shadow-[0_12px_30px_rgba(184,49,45,0.2)] transition hover:bg-[var(--red-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
        <Link className="font-semibold text-[var(--red)] hover:underline" href={isLogin ? "/register" : "/login"}>
          {isLogin ? "Đăng ký" : "Đăng nhập"}
        </Link>
      </p>
    </form>
  );
}
