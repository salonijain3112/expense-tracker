import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from '@/context/CurrencyContext';
import { AccountProvider } from '@/context/AccountContext';
import { TransactionProvider } from '@/context/TransactionContext';

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "A simple expense tracker web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AccountProvider>
          <TransactionProvider>
            <CurrencyProvider>{children}</CurrencyProvider>
          </TransactionProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
