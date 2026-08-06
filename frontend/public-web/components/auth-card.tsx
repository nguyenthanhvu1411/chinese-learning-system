import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/">
          中文学习
        </Link>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
    </main>
  );
}

export function Message({ type, children }: { type: "error" | "success"; children: ReactNode }) {
  return <p className={`message ${type}`}>{children}</p>;
}
