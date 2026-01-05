
import React from 'react';
import { Button } from './UI';

export const PageHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
    <h1 className="text-[#005B5C] text-3xl font-black tracking-tighter uppercase">{title}</h1>
    <div className="flex items-center gap-3">{children}</div>
  </div>
);

export const RefreshButton: React.FC<{ isRefreshing: boolean; onClick: () => void }> = ({ isRefreshing, onClick }) => (
  <Button variant="outline" onClick={onClick} className="bg-white border text-[#005B5C] px-5 py-2 !rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-gray-50">
    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    Refresh Data
  </Button>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <tr>
    <td colSpan={10} className="py-24 text-center">
        <div className="text-4xl mb-4 opacity-20">🗃️</div>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest italic">{message}</p>
    </td>
  </tr>
);

export const TableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full overflow-x-auto custom-scrollbar">
      {children}
  </div>
);
