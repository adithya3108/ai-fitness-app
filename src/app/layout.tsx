import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Fitness Assistant",
  description: "Your personalized workout and diet planner powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-950`}>
        {children}
      </body>
    </html>
  );
}
