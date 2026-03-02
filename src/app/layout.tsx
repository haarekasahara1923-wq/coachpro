import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachPro - AI Powered Coaching Management Platform",
  description: "India's most powerful coaching management SaaS. Automate admissions, fees, attendance, exams, and parent communication. Built for 10,000+ coaching centers.",
  keywords: "coaching management software, coaching institute software, coaching ERP, student management, fee management, India",
  openGraph: {
    title: "CoachPro - AI Powered Coaching Management Platform",
    description: "Automate your entire coaching institute with AI-powered tools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
