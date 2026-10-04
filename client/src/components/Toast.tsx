import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 16, left: 0, right: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-banner"
          style={{ pointerEvents: 'auto' }}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} color="#00ff66" />}
          {toast.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {toast.type === 'info' && <Info size={18} color="#00e5ff" />}
          <span style={{ flex: 1 }}>{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
