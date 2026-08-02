# Chinese Learning System

Nền tảng học tiếng Trung cá nhân hóa, được xây dựng bằng Next.js App Router, TypeScript và Tailwind CSS.

## Bắt đầu

Yêu cầu Node.js 20.9 trở lên.

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Lệnh kiểm tra

```bash
npm run lint
npm run build
```

## Cấu trúc chính

```text
src/
  app/          # Route, layout và giao diện App Router
public/         # Tài nguyên tĩnh
```

## Lộ trình kỹ thuật

- Supabase: xác thực, cơ sở dữ liệu và lưu tiến độ học.
- OpenAI API: hội thoại, chấm câu và phản hồi cá nhân hóa.
- Vercel: preview deployment và production deployment.

Không commit khóa bí mật. Khi bắt đầu tích hợp dịch vụ, sao chép `.env.example` thành `.env.local`.
