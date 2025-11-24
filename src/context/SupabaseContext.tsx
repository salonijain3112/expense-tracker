'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import SupabaseSetup from '@/components/SupabaseSetup';
import {
  clearSupabaseClient,
  getSupabaseClient,
  initializeSupabaseClient,
  isSupabaseClientInitialized,
} from '@/lib/supabase/client';

const STORAGE_KEY = 'expense-tracker.supabase-config';

interface SupabaseContextValue {
  supabase: SupabaseClient;
  resetSupabaseConfig: () => void;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [client, setClient] = useState<SupabaseClient | null>(() =>
    isSupabaseClientInitialized() ? getSupabaseClient() : null
  );
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [storedConfig, setStoredConfig] = useState<{ url: string; anonKey: string } | null>(null);

  useEffect(() => {
    if (client) {
      setIsCheckingConfig(false);
      return;
    }

    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (envUrl && envAnonKey) {
      setClient(initializeSupabaseClient(envUrl, envAnonKey));
      return;
    }

    if (typeof window !== 'undefined') {
      const rawConfig = window.localStorage.getItem(STORAGE_KEY);
      if (rawConfig) {
        try {
          const parsed = JSON.parse(rawConfig) as { url?: string; anonKey?: string };
          if (parsed.url && parsed.anonKey) {
            setClient(initializeSupabaseClient(parsed.url, parsed.anonKey));
            setStoredConfig({ url: parsed.url, anonKey: parsed.anonKey });
            return;
          }
          if (parsed.url || parsed.anonKey) {
            setStoredConfig({
              url: parsed.url ?? '',
              anonKey: parsed.anonKey ?? '',
            });
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    }

    setIsCheckingConfig(false);
  }, [client]);

  const handleSaveConfig = useCallback((url: string, anonKey: string) => {
    const trimmedUrl = url.trim();
    const trimmedAnonKey = anonKey.trim();

    if (!trimmedUrl || !trimmedAnonKey) {
      setSetupError('Both Supabase URL and anon key are required.');
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setSetupError('Please enter a valid Supabase URL (must start with http or https).');
      return;
    }

    setIsSavingConfig(true);
    setSetupError(null);
    try {
      const newClient = initializeSupabaseClient(trimmedUrl, trimmedAnonKey);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ url: trimmedUrl, anonKey: trimmedAnonKey })
        );
      }
      setStoredConfig({ url: trimmedUrl, anonKey: trimmedAnonKey });
      setClient(newClient);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to initialize Supabase. Please try again.';
      setSetupError(message);
    } finally {
      setIsSavingConfig(false);
    }
  }, []);

  const resetSupabaseConfig = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    clearSupabaseClient();
    setStoredConfig(null);
    setClient(null);
    setIsCheckingConfig(false);
  }, []);

  const contextValue = useMemo(() => {
    if (!client) {
      return undefined;
    }

    return {
      supabase: client,
      resetSupabaseConfig,
    };
  }, [client, resetSupabaseConfig]);

  if (isCheckingConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-dark-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!client || !contextValue) {
    return (
      <SupabaseSetup
        initialUrl={storedConfig?.url}
        initialAnonKey={storedConfig?.anonKey}
        isSaving={isSavingConfig}
        error={setupError}
        onSubmit={handleSaveConfig}
      />
    );
  }

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
};

export const useSupabaseConfig = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabaseConfig must be used within a SupabaseProvider');
  }
  return context.resetSupabaseConfig;
};
