// Phụ trách phần tinh gọn: Tân. Metadata khớp các tính năng đang chạy.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HiHiHaHa Auto | Quản lý gara",
  description:
    "Đồ án Lập trình Web: quản lý lệnh sửa chữa, kho phụ tùng và thanh toán với Java Servlet.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

// Tân: layout gốc bọc tất cả route; đặt ngôn ngữ tiếng Việt và CSS chung cho toàn site.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
