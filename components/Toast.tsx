
import React from 'react';
import { useAppContext } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-5 right-5 z-[2000] w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-8 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-[#006D77] text-white' : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex-1 text-sm font-bold">{toast.message}</div>
          <button onClick={() => removeToast(toast.id)} className="text-lg font-bold leading-none opacity-70 hover:opacity-100">&times;</button>
        </div>
      ))}
    </div>
  );
};
