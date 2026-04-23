import { useEffect } from 'react';
import { X } from 'lucide-react';

const typeStyles = {
  success: 'border-neon-primary text-neon-primary',
  error: 'border-neon-warning text-neon-warning',
  info: 'border-neon-secondary text-neon-secondary',
};

export default function CustomToast({ type = 'info', message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl bg-navy-800/90 border ${typeStyles[type] || typeStyles.info} shadow-lg animate-slide-in max-w-sm`}>
      <span className="flex-1 text-sm text-white/90">{message}</span>
      <button onClick={onClose} className="text-white/50 hover:text-white transition-colors"><X size={14} /></button>
    </div>
  );
}
