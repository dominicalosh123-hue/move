import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const STATUSES = ['All', 'To Watch', 'Watching', 'Watched'];

export default function FilterBar({
  statusFilter,
  setStatusFilter,
  genreFilter,
  setGenreFilter,
  searchQuery,
  setSearchQuery,
  totalResults
}) {
  const hasActiveFilters = statusFilter !== 'All' || genreFilter !== 'All' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setStatusFilter('All');
    setGenreFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {STATUSES.map(status => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                id={`filter-status-${status.toLowerCase().replace(/\s+/g, '-')}`}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(status)}
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 1rem'
                }}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* Search & Genre Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          {/* Genre Dropdown */}
          <div style={{ minWidth: '150px' }}>
            <select
              id="filter-genre-select"
              className="form-select"
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
              style={{ padding: '0.55rem 0.8rem', fontSize: '0.85rem' }}
            >
              <option value="All">All Genres</option>
              {GENRES.filter(g => g !== 'All').map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '220px', maxWidth: '300px', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search by title..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '2.25rem',
                paddingRight: searchQuery ? '2rem' : '0.75rem',
                paddingTop: '0.55rem',
                paddingBottom: '0.55rem',
                fontSize: '0.85rem'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
              title="Reset all filters"
            >
              <X size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Subtext */}
      <div style={{
        marginTop: '0.85rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <span>
          Showing <strong>{totalResults}</strong> movie{totalResults === 1 ? '' : 's'}
          {statusFilter !== 'All' ? ` in "${statusFilter}"` : ''}
          {genreFilter !== 'All' ? ` • Genre: ${genreFilter}` : ''}
          {searchQuery ? ` • Matching "${searchQuery}"` : ''}
        </span>
        {statusFilter === 'To Watch' && (
          <span style={{ color: '#a5b4fc', fontSize: '0.75rem' }}>
            Sorted by Priority (Highest first)
          </span>
        )}
      </div>
    </div>
  );
}
