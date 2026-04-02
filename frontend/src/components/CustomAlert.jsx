import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-[var(--color-tertiary)] shrink-0" />,
  error:   <XCircle      className="w-5 h-5 text-[var(--color-error)]    shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-[var(--color-secondary)]  shrink-0" />,
  info:    <Info          className="w-5 h-5 text-[var(--color-primary)]   shrink-0" />,
};

const STYLES = {
  success: 'bg-[var(--color-tertiary)]/10 border border-[var(--color-tertiary)]/20 text-[var(--color-tertiary)] shadow-[0_0_15px_rgba(184,255,185,0.1)]',
  error:   'bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] shadow-[0_0_15px_rgba(255,113,108,0.1)] animate-alert-pulse',
  warning: 'bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 text-[var(--color-secondary)] shadow-[0_0_15px_rgba(254,148,0,0.1)]',
  info:    'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] shadow-[0_0_15px_rgba(122,175,255,0.1)]',
};

/**
 * CustomAlert — toast-style alert that auto-dismisses.
 *
 * Props:
 *   message  (string)   - text to display
 *   type     (string)   - 'success' | 'error' | 'warning' | 'info'  (default: 'info')
 *   duration (number)   - ms before auto-dismiss  (default: 3500, pass 0 to disable)
 *   onClose  (function) - called when the alert is dismissed
 */
const CustomAlert = ({ message, type = 'info', duration = 3500, onClose }) => {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    // Wait for exit animation before calling onClose
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      style={{
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(-12px)',
      }}
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl
        pointer-events-auto max-w-sm w-full backdrop-blur-xl
        ${STYLES[type] || STYLES.info}
      `}
      role="alert"
    >
      {ICONS[type] || ICONS.info}
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      <button
        onClick={handleClose}
        className="ml-1 mt-0.5 opacity-60 hover:opacity-100 transition"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * AlertContainer — fixed overlay that stacks multiple alerts.
 *
 * Usage:
 *   const { showAlert, AlertContainer } = useAlert();
 *   <AlertContainer />   ← place once, near the root
 *   showAlert('Saved!', 'success');
 */
export const useAlert = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const AlertContainer = () => (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        pointerEvents: 'none',
      }}
    >
      {alerts.map(a => (
        <CustomAlert
          key={a.id}
          message={a.message}
          type={a.type}
          duration={a.duration}
          onClose={() => removeAlert(a.id)}
        />
      ))}
    </div>
  );

  return { showAlert, AlertContainer };
};

export default CustomAlert;
