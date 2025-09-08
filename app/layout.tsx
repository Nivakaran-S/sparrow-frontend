import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const amazonEmber = localFont({
  src: [
    {
      path: "../public/fonts/AmazonEmber-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/AmazonEmber-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-amazon-ember",
});

export const metadata: Metadata = {
  title: "Sparrow",
  description: "Package Delivery Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${amazonEmber.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
