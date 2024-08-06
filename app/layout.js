import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pantry Tracker",
  description: "Pantry Tracker is a user-friendly app designed to help you manage and organize your pantry items effortlessly. With features like inventory tracking, expiration date reminders, and shopping list creation, it ensures you never run out of essentials and minimizes food waste.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
