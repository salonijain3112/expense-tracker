"use client";

import { useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Transaction } from '@/types';

interface DataImportExportProps {
  transactions: Transaction[];
  onImport: (importedTransactions: Transaction[]) => void;
}

const DataImportExport = ({ transactions, onImport }: DataImportExportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const processImportedData = (data: Omit<Transaction, 'id'>[]) => {
    const validTransactions = data
      .map((row) => ({
        ...row,
        amount: parseFloat(row.amount as any),
      }))
      .filter(
        (row) =>
          row.description &&
          row.amount > 0 &&
          (row.type === 'income' || row.type === 'expense')
      );

    const newTransactions: Transaction[] = validTransactions.map(t => ({ ...t, id: crypto.randomUUID() }));
    onImport(newTransactions);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      Papa.parse<Omit<Transaction, 'id'>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedData(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Failed to parse CSV file. Please check the format.');
        },
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<Omit<Transaction, 'id'>>(worksheet);
          processImportedData(json);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          alert('Failed to process Excel file.');
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading Excel file:', error);
        alert('Failed to read Excel file.');
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Unsupported file type. Please upload a CSV or Excel file.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Data Management</h2>
      
      {/* Import Section */}
      <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-2">Import Transactions</label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-500 dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-dark-card focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent dark:focus:ring-offset-dark-bg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Click to upload a file</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv, .xlsx, .xls"
        />
        <p className="text-xs text-gray-500 dark:text-dark-subtle mt-2">Supported formats: CSV, XLSX, XLS.</p>
      </div>

      {/* Export Section */}
      <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-2">Export Transactions</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-dark-text bg-brand-secondary dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent dark:focus:ring-offset-dark-card disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={transactions.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-dark-text bg-brand-secondary dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent dark:focus:ring-offset-dark-card disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataImportExport;
