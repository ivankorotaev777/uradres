import type { Viewport } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

/** Lock light UI so Android/Chrome do not auto-invert colors in system dark mode. */
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fafbfc",
};

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
    <html lang="ru" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className={`${onest.variable} antialiased`}>{children}</body>
    </html>
  );
}
