import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  movie,
  onClose,
  onConfirm,
  isDeleting
}) {
  if (!isOpen || !movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '420px', textAlign: 'center' }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Warning Icon */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(244, 63, 94, 0.15)',
          color: '#f43f5e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <AlertTriangle size={28} />
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
          Delete Movie?
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Are you sure you want to permanently remove <strong style={{ color: '#fff' }}>"{movie.title}"</strong> ({movie.movieCode}) from your watchlist?
        </p>

        <div style={{
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.65rem 0.85rem',
          fontSize: '0.78rem',
          color: '#fda4af',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          Status: <strong>{movie.status}</strong> • Note: Movies in "Watching" status are protected from deletion by policy.
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
            style={{ minWidth: '100px' }}
          >
            Cancel
          </button>

          <button
            id="confirm-delete-movie-btn"
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(movie)}
            disabled={isDeleting}
            style={{
              minWidth: '130px',
              background: '#e11d48',
              color: '#ffffff'
            }}
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
