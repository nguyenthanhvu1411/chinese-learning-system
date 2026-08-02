"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Vui lòng nhập địa chỉ email hợp lệ." } as const;
  }

  if (password.length < 6) {
    return { error: "Mật khẩu cần có ít nhất 6 ký tự." } as const;
  }

  return { email, password } as const;
}

export async function login(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const credentials = readCredentials(formData);
  if ("error" in credentials) return { error: credentials.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: "Email hoặc mật khẩu chưa đúng." };
  }

  redirect("/dashboard");
}

export async function register(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const credentials = readCredentials(formData);
  if ("error" in credentials) return { error: credentials.error };

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (fullName.length < 2) {
    return { error: "Vui lòng nhập tên của bạn." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: "Không thể tạo tài khoản. Email có thể đã được sử dụng." };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    success: "Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản.",
  };
}

export async function logout() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
