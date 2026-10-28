import React, { useState } from 'react';
import { Star, CheckCircle, X, AlertCircle } from 'lucide-react';

export default function RatingPromptModal({
  isOpen,
  movie,
  onClose,
  onConfirm,
  isSubmitting
}) {
  const [rating, setRating] = useState(8);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen || !movie) return null;

  const handleConfirm = () => {
    if (!rating || rating < 1 || rating > 10) {
      setError('A rating between 1 and 10 is mandatory.');
      return;
    }
    setError('');
    onConfirm(movie, rating);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '440px', textAlign: 'center' }}
      >
        {/* Close Button */}
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

        {/* Celebration icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <CheckCircle size={32} />
        </div>

        <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.4rem' }}>
          Mark as Watched
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          You've finished watching <strong style={{ color: '#fff' }}>"{movie.title}"</strong>.
          <br />
          <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
            Rating from 1 to 10 is mandatory.
          </span>
        </p>

        {error && (
          <div className="form-alert-error" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Star Rating Display */}
        <div style={{
          background: 'rgba(15, 21, 35, 0.7)',
          padding: '1.25rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#fbbf24',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-heading)'
          }}>
            {hoverRating || rating} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 10</span>
          </div>

          {/* 10 Interactive Star Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    transform: active ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.15s ease'
                  }}
                  title={`Rate ${star} / 10`}
                >
                  <Star
                    size={22}
                    fill={active ? '#fbbf24' : 'transparent'}
                    color={active ? '#fbbf24' : 'rgba(255, 255, 255, 0.25)'}
                  />
                </button>
              );
            })}
          </div>

          <input
            id="watched-rating-slider"
            type="range"
            min="1"
            max="10"
            step="1"
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            style={{ width: '85%', accentColor: '#fbbf24', cursor: 'pointer' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ minWidth: '100px' }}
          >
            Cancel
          </button>

          <button
            id="confirm-watched-status-btn"
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              minWidth: '140px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
