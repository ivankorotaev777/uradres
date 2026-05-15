import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${onest.variable} antialiased`}>{children}</body>
    </html>
  );
}
