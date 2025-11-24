import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from '@/context/CurrencyContext';
import { AccountProvider } from '@/context/AccountContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { AuthProvider } from '@/context/AuthContext';
import { SupabaseProvider } from '@/context/SupabaseContext';

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
        <SupabaseProvider>
          <AuthProvider>
            <AccountProvider>
              <TransactionProvider>
                <CurrencyProvider>{children}</CurrencyProvider>
              </TransactionProvider>
            </AccountProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
