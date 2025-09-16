import { Transaction } from '@/types';

// Heuristics to normalize various imported schemas into our Transaction shape (without id)
export type RawRow = Record<string, any>;

function toLowerNoSpaces(s?: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '');
}

function parseAmount(value: any): number | null {
  if (value == null) return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[,\s]/g, ''));
  if (Number.isNaN(n)) return null;
  return n;
}

function parseDate(value: any): Date | undefined {
  if (!value) return undefined;
  // xlsx may provide a JS Date already
  if (value instanceof Date) return value;
  const s = String(value).trim();
  // Handle common bank format: "YYYY-MM-DD HH:mm:ss" (treat as local time)
  const match = s.match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})$/);
  if (match) {
    const isoLike = `${match[1]}T${match[2]}`; // local time
    const d = new Date(isoLike);
    if (!isNaN(d.getTime())) return d;
  }
  // Try direct ISO parse as a fallback
  const d2 = new Date(s);
  if (!isNaN(d2.getTime())) return d2;
  return undefined;
}

function normalizeType(rawType: any, amount: number | null): 'income' | 'expense' | null {
  const t = toLowerNoSpaces(String(rawType || ''));
  if (t === 'income') return 'income';
  if (t === 'expenses' || t === 'expense') return 'expense';
  if (amount != null) {
    // Fallback: sign-based inference
    return amount >= 0 ? 'income' : 'expense';
  }
  return null;
}

// Detects if the header set matches the provided file (account, category, currency, amount, ref_currency_amount, type, payment_type, payment_type_local, note, date, ...)
function looksLikeReportSchema(headers: string[]): boolean {
  const expected = ['account', 'category', 'currency', 'amount', 'type', 'note', 'date'];
  const set = new Set(headers.map(h => h.toLowerCase()));
  return expected.every(e => set.has(e));
}

// Detect a simple generic schema we already supported earlier
function looksLikeGenericSchema(headers: string[]): boolean {
  const set = new Set(headers.map(h => h.toLowerCase()));
  return set.has('description') && set.has('amount');
}

export function normalizeImportedRows(rows: RawRow[]): Omit<Transaction, 'id'>[] {
  if (!rows || rows.length === 0) return [];
  // Normalize headers: in case xlsx used different casing
  const headers = Array.from(new Set(Object.keys(rows[0] || {}).map(h => h.trim())));
  const lowerHeaderMap = new Map(headers.map(h => [h.toLowerCase(), h]));

  const get = (row: RawRow, key: string) => row[lowerHeaderMap.get(key.toLowerCase()) || key];

  let mode: 'report' | 'generic' = 'generic';
  if (looksLikeReportSchema(headers)) mode = 'report';
  else if (looksLikeGenericSchema(headers)) mode = 'generic';

  const out: Omit<Transaction, 'id'>[] = [];

  for (const row of rows) {
    if (!row) continue;

    if (mode === 'report') {
      const amountRaw = get(row, 'amount');
      const amount = parseAmount(amountRaw);
      const type = normalizeType(get(row, 'type'), amount);
      const description = String(get(row, 'note') ?? '').trim();
      const date = parseDate(get(row, 'date'));

      if (!description && amount == null) continue; // empty row
      if (amount == null) continue;
      if (type == null) continue;

      out.push({
        accountId: '', // will be set by caller based on selected account
        description: description || 'Transaction',
        amount: Math.abs(amount),
        type,
        date,
      });
    } else {
      // generic: description, amount, optional type, date
      const description = String(get(row, 'description') ?? '').trim();
      const amount = parseAmount(get(row, 'amount'));
      const type = normalizeType(get(row, 'type'), amount);
      const date = parseDate(get(row, 'date'));

      if (!description && amount == null) continue;
      if (amount == null) continue;
      if (type == null) continue;

      out.push({
        accountId: '',
        description,
        amount: Math.abs(amount),
        type,
        date,
      });
    }
  }

  return out;
}

// Returns normalized transactions plus any detected account name per row for mapping by caller
export function extractImportedRows(rows: RawRow[]): { tx: Omit<Transaction, 'id'>; accountName?: string }[] {
  if (!rows || rows.length === 0) return [];
  const headers = Array.from(new Set(Object.keys(rows[0] || {}).map(h => h.trim())));
  const lowerHeaderMap = new Map(headers.map(h => [h.toLowerCase(), h]));
  const get = (row: RawRow, key: string) => row[lowerHeaderMap.get(key.toLowerCase()) || key];

  let mode: 'report' | 'generic' = 'generic';
  if (looksLikeReportSchema(headers)) mode = 'report';
  else if (looksLikeGenericSchema(headers)) mode = 'generic';

  const out: { tx: Omit<Transaction, 'id'>; accountName?: string }[] = [];
  for (const row of rows) {
    if (!row) continue;
    if (mode === 'report') {
      const amount = parseAmount(get(row, 'amount'));
      const type = normalizeType(get(row, 'type'), amount);
      const description = String(get(row, 'note') ?? '').trim();
      const date = parseDate(get(row, 'date'));
      const accountName = String(get(row, 'account') ?? '').trim();
      if (!description && amount == null) continue;
      if (amount == null || type == null) continue;
      out.push({
        tx: {
          accountId: '',
          description: description || 'Transaction',
          amount: Math.abs(amount),
          type,
          date,
        },
        accountName: accountName || undefined,
      });
    } else {
      const description = String(get(row, 'description') ?? '').trim();
      const amount = parseAmount(get(row, 'amount'));
      const type = normalizeType(get(row, 'type'), amount);
      const date = parseDate(get(row, 'date'));
      const accountName = String(get(row, 'account') ?? '').trim();
      if (!description && amount == null) continue;
      if (amount == null || type == null) continue;
      out.push({
        tx: {
          accountId: '',
          description,
          amount: Math.abs(amount),
          type,
          date,
        },
        accountName: accountName || undefined,
      });
    }
  }
  return out;
}
