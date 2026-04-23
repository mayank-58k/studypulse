import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useKeyboardShortcuts(onShowModal) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case 'n': navigate('/assignments'); break;
        case 't': navigate('/timer'); break;
        case 'g': navigate('/goals'); break;
        case 'c': navigate('/calendar'); break;
        case 's': navigate('/subjects'); break;
        case '?': if (onShowModal) onShowModal(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onShowModal]);
}
