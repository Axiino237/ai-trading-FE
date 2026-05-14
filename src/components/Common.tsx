import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
    {children}
  </div>
);

export const DataTable: React.FC<{
  headers: string[],
  children: React.ReactNode,
  className?: string
}> = ({ headers, children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm ${className}`}>
    <table className="w-full border-collapse min-w-[600px]">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          {headers.map((header, i) => (
            <th key={i} className="px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {children}
      </tbody>
    </table>
  </div>
);

export const SearchBar: React.FC<{
  value: string,
  onChange: (val: string) => void,
  onAction: () => void,
  placeholder?: string,
  actionLabel?: string
}> = ({ value, onChange, onAction, placeholder = "Search symbols...", actionLabel = "Add" }) => (
  <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-4xl">
    <div className="w-full md:flex-1 relative">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 ring-blue-600/5 dark:ring-blue-500/10 transition-all font-bold text-slate-700 dark:text-slate-200"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
    </div>
    <button
      onClick={onAction}
      className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 dark:shadow-blue-600/40 whitespace-nowrap"
    >
      {actionLabel}
    </button>
  </div>
);

export const FilterBar: React.FC<{
  options: { label: string, value: string }[],
  activeValue: string,
  onSelect: (val: any) => void
}> = ({ options, activeValue, onSelect }) => (
  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onSelect(opt.value)}
        className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${activeValue === opt.value ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-600/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);
