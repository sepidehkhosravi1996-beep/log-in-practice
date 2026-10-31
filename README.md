# Contact

پروژهٔ Next.js با React، TypeScript، App Router، Tailwind CSS و ESLint.

## اجرا در PowerShell

```powershell
cd D:\contact
npm.cmd install
npm.cmd run dev
```

سپس http://localhost:3000 را در مرورگر باز کنید. پس از نصب اولیه، برای اجرا فقط `npm.cmd run dev` لازم است.

## دستورها

- `npm.cmd run dev`: اجرای محیط توسعه
- `npm.cmd run lint`: بررسی کد با ESLint
- `npm.cmd run typecheck`: بررسی TypeScript
- `npm.cmd run build`: ساخت نسخهٔ نهایی
- `npm.cmd start`: اجرای نسخهٔ ساخته‌شده

## ساختار

- `src/app/page.tsx`: صفحهٔ اصلی
- `src/app/layout.tsx`: چیدمان و مشخصات صفحه
- `src/app/globals.css`: استایل‌های عمومی و Tailwind
- `src/components/`: کامپوننت‌های قابل استفادهٔ مجدد
- `src/lib/`: توابع و ابزارهای مشترک
- `public/images/`: تصاویر و فایل‌های ثابت

مسیر کوتاه `@/*` به `src/*` اشاره می‌کند. نسخهٔ Node.js باید 20.9 یا بالاتر باشد.

فایل `.env.example` نمونهٔ متغیرهای محیطی است؛ در صورت نیاز `.env.local` بسازید. این پروژه فعلاً به متغیر محیطی، پایگاه داده یا API نیاز ندارد.
