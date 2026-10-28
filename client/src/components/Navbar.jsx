import React from 'react';
import { Film, Sparkles, Plus, Clapperboard } from 'lucide-react';

export default function Navbar({ onOpenAddModal, onWatchNext, isWatchNextLoading }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '2rem'
    }}>
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        paddingBottom: '1rem'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Clapperboard size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', lineHeight: 1.1, color: '#ffffff' }}>
              Cine<span style={{ color: '#818cf8' }}>Log</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Movie Watchlist Manager
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            id="btn-watch-next"
            className="btn btn-magic"
            onClick={onWatchNext}
            disabled={isWatchNextLoading}
            title="Pick the highest priority movie to watch next"
          >
            <Sparkles size={16} />
            <span>{isWatchNextLoading ? 'Searching...' : 'What should I watch next?'}</span>
          </button>

          <button
            id="btn-add-movie"
            className="btn btn-primary"
            onClick={onOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Movie</span>
          </button>
        </div>
      </div>
    </header>
  );
}
