import React from 'react';
import { Sparkles, X, Play, Clock, Flame, Calendar, Tv } from 'lucide-react';

export default function WatchNextModal({
  isOpen,
  movie,
  onClose,
  onStartWatching
}) {
  if (!isOpen || !movie) return null;

  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const formattedRuntime = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #12192e 0%, #0a0e1c 100%)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 50px rgba(139, 92, 246, 0.25)'
        }}
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

        {/* Glow Header Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)'
        }}>
          <Sparkles size={32} />
        </div>

        <span style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#c084fc',
          display: 'block',
          marginBottom: '0.35rem'
        }}>
          Top Recommendation
        </span>

        <h2 style={{
          fontSize: '1.75rem',
          color: '#fff',
          marginBottom: '0.5rem',
          lineHeight: 1.25
        }}>
          {movie.title}
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <span className="badge badge-code">{movie.movieCode}</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
            {movie.genre}
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
            <Calendar size={11} /> {movie.releaseYear}
          </span>
        </div>

        {/* Highlight Criteria Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem',
          marginBottom: '1.75rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Priority (Highest)
            </span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#f43f5e',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              <Flame size={15} fill="currentColor" /> {movie.priority} / 5
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Runtime
            </span>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#38bdf8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              <Clock size={15} /> {movie.runtime}m
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Platform
            </span>
            <span style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#fbbf24',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              <Tv size={15} /> {movie.platform}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Selected using backend algorithm: Highest priority among all To Watch films, optimized by shortest runtime.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            id="watch-next-start-btn"
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onStartWatching(movie);
            }}
            style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Play size={16} fill="currentColor" />
            <span>Start Watching Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
