
import React, { useEffect } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', fullWidth, className, ...props 
}) => {
  const variants = {
    primary: 'bg-[#006D77] text-white hover:bg-[#005c65] shadow-md',
    secondary: 'bg-[#E29578] text-white hover:bg-opacity-90 shadow-md',
    outline: 'border border-gray-200 text-gray-500 bg-white hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    teal: 'bg-[#005B5C] text-white hover:bg-teal-900 shadow-lg'
  };

  const sizes = {
    sm: 'px-3 py-1.5 md:px-4 md:py-2 text-[10px] font-black uppercase tracking-widest',
    md: 'px-4 py-2.5 md:px-6 md:py-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest',
    lg: 'px-6 py-3 md:px-8 md:py-4 text-xs font-black uppercase tracking-[0.2em]'
  };

  return (
    <button 
      className={`rounded-xl md:rounded-2xl transition-all duration-200 disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const StarRating: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span key={i} className={`text-sm md:text-lg ${i < count ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
);

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

export const AmenityPill: React.FC<{ name: string }> = ({ name }) => {
  const getIcon = (n: string) => {
    const lower = n.toLowerCase();
    if (lower.includes('wifi')) return '📶';
    if (lower.includes('view')) return '🕋';
    if (lower.includes('lounge') || lower.includes('room')) return '👥';
    if (lower.includes('desk') || lower.includes('hour')) return '🕒';
    if (lower.includes('restaurant') || lower.includes('breakfast')) return '🍴';
    return '✓';
  };

  return (
    <div className="inline-flex items-center gap-2 bg-[#F0F7F8] text-[#006D77] px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black border border-[#DCEEF0] uppercase tracking-widest whitespace-nowrap">
      <span className="opacity-70">{getIcon(name)}</span>
      {name}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'star'; className?: string }> = ({ children, variant = 'info', className = '' }) => {
  const styles = {
    success: 'bg-green-500 text-white border-transparent',
    warning: 'bg-yellow-400 text-white border-transparent',
    danger: 'bg-red-500 text-white border-transparent',
    info: 'bg-[#006D77] text-white border-transparent',
    star: 'bg-white text-neutralDark border-gray-100 shadow-sm font-bold'
  };
  return (
    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-black uppercase border leading-none inline-flex items-center justify-center ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-gray-100 transition-shadow duration-300 ${className}`}
  >
    {children}
  </div>
);

export const TableWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full overflow-x-auto custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
    <div className="min-w-[800px] md:min-w-full">
      {children}
    </div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: string }> = ({ label, icon, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">{label}</label>}
    <div className="relative">
      <input 
        className={`block w-full p-3 md:p-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-none focus:ring-0 focus:border-[#005B5C] focus:bg-white outline-none transition-all font-bold text-xs md:text-sm ${className}`}
        {...props}
      />
      {props.type === 'date' && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#005B5C] opacity-30">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </span>
      )}
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { 
  label?: string, 
  options: { label: string, value: string | number }[] 
}> = ({ label, options, className, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 ml-1">{label}</label>}
    <div className="relative">
      <select 
        className={`block w-full p-3 md:p-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-none focus:ring-0 focus:border-[#005B5C] focus:bg-white outline-none appearance-none transition-all font-bold text-xs md:text-sm ${className}`}
        {...props}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#005B5C] opacity-30 font-bold text-[8px] md:text-[10px]">
        ▼
      </div>
    </div>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/90 p-0 md:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white shadow-[0_50px_100px_rgba(0,0,0,0.6)] w-full max-w-xl flex flex-col overflow-hidden relative h-[90vh] md:h-auto md:max-h-[85vh] rounded-none"
      >
        <div className="px-6 py-4 md:px-8 md:py-6 border-b bg-white shrink-0 flex justify-between items-center z-50">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-8 h-8 md:w-10 md:h-10 bg-[#005B5C] rounded-none flex items-center justify-center text-lg md:text-xl shadow-lg shadow-[#005B5C]/20">🕋</div>
             <div>
                <h3 className="text-sm md:text-lg font-black text-[#005B5C] uppercase tracking-tight leading-none">{title}</h3>
                <p className="text-[7px] md:text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1 opacity-60">Verified Registry Inquiry</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 transition-colors text-xl"
          >&times;</button>
        </div>

        <div className="flex-1 bg-white p-6 md:p-8 overflow-y-auto custom-scrollbar">
           {children}
        </div>
      </div>
    </div>
  );
};

export const NotificationTicker: React.FC<{ notifications: string[] }> = ({ notifications }) => {
  if (!notifications.length) return null;
  const [isVisible, setIsVisible] = React.useState(true);
  if (!isVisible) return null;

  return (
    <div className="bg-[#FDE2D1] text-[#005B5C] py-1.5 md:py-2 relative overflow-hidden border-b border-black/5">
      <div className="flex animate-marquee hover:pause-marquee whitespace-nowrap">
        {notifications.map((n, i) => (
          <span key={i} className="mx-4 md:mx-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center shrink-0">
            <span className="mx-2 md:mx-4 opacity-20">•</span>
            {n}
          </span>
        ))}
      </div>
      <button onClick={() => setIsVisible(false)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-lg text-[#005B5C] font-light z-10 bg-[#FDE2D1] pl-2">&times;</button>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-flex; animation: marquee 35s linear infinite; }
      `}</style>
    </div>
  );
};
