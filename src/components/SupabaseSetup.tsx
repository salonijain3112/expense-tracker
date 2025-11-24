'use client';

import { FormEvent, useEffect, useState } from 'react';

interface SupabaseSetupProps {
  initialUrl?: string | null;
  initialAnonKey?: string | null;
  isSaving?: boolean;
  error?: string | null;
  onSubmit: (url: string, anonKey: string) => void;
}

const SupabaseSetup = ({
  initialUrl = '',
  initialAnonKey = '',
  isSaving = false,
  error,
  onSubmit,
}: SupabaseSetupProps) => {
  const [supabaseUrl, setSupabaseUrl] = useState(initialUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialAnonKey);

  useEffect(() => {
    setSupabaseUrl(initialUrl ?? '');
  }, [initialUrl]);

  useEffect(() => {
    setSupabaseAnonKey(initialAnonKey ?? '');
  }, [initialAnonKey]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(supabaseUrl, supabaseAnonKey);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-xl space-y-8 rounded-2xl bg-white p-10 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configure Supabase</h1>
          <p className="text-sm text-gray-600">
            Enter your Supabase project credentials to finish setting up the Expense Tracker.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-gray-700">
              Supabase Project URL
            </label>
            <input
              id="supabase-url"
              type="url"
              value={supabaseUrl}
              onChange={(event) => setSupabaseUrl(event.target.value)}
              placeholder="https://your-project.supabase.co"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="supabase-anon-key" className="block text-sm font-medium text-gray-700">
              Supabase Anon Key
            </label>
            <textarea
              id="supabase-anon-key"
              value={supabaseAnonKey}
              onChange={(event) => setSupabaseAnonKey(event.target.value)}
              placeholder="Enter your anon key"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              You can find this in Supabase under Settings &gt; API &gt; Project API keys.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Start Expense Tracker'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupabaseSetup;
