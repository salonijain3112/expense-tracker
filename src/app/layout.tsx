import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from '@/context/CurrencyContext';
import { AccountProvider } from '@/context/AccountContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { AuthProvider } from '@/context/AuthContext';

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
        <AuthProvider>
          <AccountProvider>
            <TransactionProvider>
              <CurrencyProvider>{children}</CurrencyProvider>
            </TransactionProvider>
          </AccountProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
