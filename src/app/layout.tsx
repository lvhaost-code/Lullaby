import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lullaby · quản lý nội bộ",
  description: "Quản lý kho, đơn hàng, khách hàng và báo cáo cho Lullaby",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Work+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
