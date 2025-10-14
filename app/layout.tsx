import "./globals.css";
import type { Metadata } from "next";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  variable: "--font-raleway",
})

export const metadata: Metadata = {
  title: "Canvas",
  description: "Edit your components visually",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${raleway.variable} antialiased dark:bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
