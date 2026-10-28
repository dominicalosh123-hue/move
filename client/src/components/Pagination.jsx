import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) return null;

  // Build page numbers array
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current, and adjacent pages
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2.5rem',
      flexWrap: 'wrap'
    }}>
      {/* Prev Button */}
      <button
        id="pagination-prev-btn"
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        style={{ padding: '0.5rem 0.85rem' }}
      >
        <ChevronLeft size={16} />
        <span>Prev</span>
      </button>

      {/* Page Numbers */}
      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '0 0.4rem', color: 'var(--text-muted)' }}>
                ...
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              id={`pagination-page-${p}`}
              onClick={() => onPageChange(p)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: isActive ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                background: isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        id="pagination-next-btn"
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        style={{ padding: '0.5rem 0.85rem' }}
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
