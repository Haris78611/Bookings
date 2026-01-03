
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', fullWidth, className, ...props 
}) => {
  const variants = {
    primary: 'bg-[#006D77] text-white hover:bg-[#005a63] shadow-sm',
    secondary: 'bg-[#E29578] text-white hover:bg-[#d18469] shadow-sm',
    outline: 'border border-gray-300 text-[#006D77] bg-white hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    teal: 'bg-[#006D77] text-white hover:bg-[#005a63]'
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs font-bold',
    md: 'px-6 py-2.5 text-sm font-bold',
    lg: 'px-8 py-3.5 text-base font-bold'
  };

  return (
    <button 
      className={`rounded-lg transition-all duration-300 disabled:opacity-50 whitespace-nowrap flex items-center justify-center ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const StarRating: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={`text-lg ${i < count ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
);

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
    <div className="w-16 h-16 border-4 border-[#006D77]/20 border-t-[#006D77] rounded-full animate-spin"></div>
    <p className="mt-6 text-[#006D77] font-bold text-sm uppercase tracking-widest animate-pulse">Scanning Global Inventory...</p>
  </div>
);

export const AmenityPill: React.FC<{ name: string }> = ({ name }) => {
  const getIcon = (n: string) => {
    const lower = n.toLowerCase();
    if (lower.includes('wifi')) return '📶';
    if (lower.includes('room')) return '👥';
    if (lower.includes('desk') || lower.includes('hour')) return '🕒';
    if (lower.includes('restaurant') || lower.includes('breakfast')) return '🍴';
    return '✓';
  };

  return (
    <div className="inline-flex items-center gap-2 bg-[#E9F5F6] text-[#006D77] px-4 py-2 rounded-full text-sm font-semibold border border-[#D1E9EB]">
      <span className="opacity-80">{getIcon(name)}</span>
      {name}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'star' }> = ({ children, variant = 'info' }) => {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    star: 'bg-[#E29578] text-white border-transparent'
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: string }> = ({ label, icon, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{label}</label>}
    <div className="relative group">
      <input 
        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#006D77]/20 focus:border-[#006D77] outline-none transition-all placeholder:text-gray-400 font-medium ${className}`}
        {...props}
      />
      {props.type === 'date' && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl transition-opacity text-[#006D77]">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </span>
      )}
      {icon && !props.type && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity text-[#006D77]">{icon}</span>
      )}
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: {label: string, value: string}[] }> = ({ label, options, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#006D77]/20 focus:border-[#006D77] outline-none transition-all appearance-none cursor-pointer font-medium ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-400 font-black">▼</div>
    </div>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-[#006D77] tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl transition font-light">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

export const NotificationTicker: React.FC<{ notifications: string[] }> = ({ notifications }) => {
  if (!notifications.length) return null;
  return (
    <div className="bg-neutralDark text-white py-2 overflow-hidden whitespace-nowrap border-b border-white/10 relative">
      <div className="flex animate-marquee hover:pause-marquee">
        {notifications.map((n, i) => (
          <span key={i} className="mx-6 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
            <span className="text-[#E29578] font-black mx-4">|</span>
            {n}
          </span>
        ))}
        {/* Repeat for continuous loop */}
        {notifications.map((n, i) => (
          <span key={`dup-${i}`} className="mx-6 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
             <span className="text-[#E29578] font-black mx-4">|</span>
            {n}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
