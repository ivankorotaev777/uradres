import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { Header } from "@/components/Header";
import { locales, type Locale } from "@/i18n";

const onest = Onest({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ЮрАдрес — Юридический адрес в Ташкенте за 2 дня | Аренда юрадреса для ООО и ИП",
  description: "Зарегистрируйте компанию в Узбекистане без аренды офиса. Реальный кадастровый адрес с физическим представителем, регистрация в Didox, 50+ локаций по Ташкенту. От 990 000 сум/мес.",
  keywords: "юридический адрес Ташкент, юрадрес для ООО, аренда адреса для регистрации ИП, кадастровый адрес Узбекистан, регистрация компании Ташкент, Didox, e-ijara",
  authors: [{ name: "ЮрАдрес" }],
  openGraph: {
    title: "ЮрАдрес — Юридический адрес в Ташкенте за 2 дня",
    description: "Зарегистрируйте компанию в Узбекистане без аренды офиса. Реальный кадастровый адрес, физический представитель, регистрация в Didox.",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "ЮрАдрес — Юридический адрес в Ташкенте за 2 дня",
    description: "Зарегистрируйте компанию в Узбекистане без аренды офиса. От 990 000 сум/мес.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MDP27W7853"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MDP27W7853');
          `}
        </Script>
      </head>
      <body className={`${onest.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
