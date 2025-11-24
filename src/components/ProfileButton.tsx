'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAccounts } from '@/context/AccountContext';
import Image from 'next/image';
import { useSupabase } from '@/context/SupabaseContext';

const ProfileButton = () => {
  const { user, signOut } = useAuth();
  const { setSelectedAccountIds } = useAccounts();
  const supabase = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  const avatarUrl = user.user_metadata?.avatar_url;
  const userEmail = user.email || '';

  const handleClearClick = () => {
    setIsOpen(false);
    setClearError(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmClear = async () => {
    if (!user) return;

    setIsClearing(true);
    setClearError(null);
    try {
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);
      if (transactionsError) throw transactionsError;

      const { error: accountsError } = await supabase
        .from('accounts')
        .delete()
        .eq('user_id', user.id);
      if (accountsError) throw accountsError;

      setSelectedAccountIds([]);
      setIsConfirmOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      const message = error instanceof Error ? error.message : 'Failed to clear data. Please try again.';
      setClearError(message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <span className="text-lg font-semibold">{getInitials(userEmail)}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-secondary rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-2">
            <p className="text-sm text-gray-700 dark:text-dark-text">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userEmail}</p>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-600"></div>
          <button
            onClick={handleClearClick}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Clear All Data
          </button>
          <button
            onClick={signOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-hover"
          >
            Logout
          </button>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete all data?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-dark-subtle">
              This will permanently remove every account and transaction from your workspace. This action cannot be undone.
            </p>
            {clearError && (
              <p className="mt-3 text-sm text-red-600">{clearError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setClearError(null);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-hover dark:text-dark-text"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
