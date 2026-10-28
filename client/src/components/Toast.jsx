import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          )}

          <div style={{ flex: 1, wordBreak: 'break-word' }}>
            {toast.message}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'currentColor',
              opacity: 0.7,
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex'
            }}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
