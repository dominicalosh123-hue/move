import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Star,
  Tv,
  Flame,
  Edit2,
  Trash2,
  CheckCircle,
  PlayCircle,
  ArrowRightCircle,
  Lock,
  ChevronDown
} from 'lucide-react';

export default function MovieCard({
  movie,
  onEdit,
  onDeleteRequest,
  onStatusTransition
}) {
  const {
    _id,
    movieCode,
    title,
    genre,
    releaseYear,
    runtime,
    platform,
    priority,
    status,
    rating,
    watchedDate
  } = movie;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Format runtime into hours and minutes
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const formattedRuntime = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;

  // Status-specific allowed next transitions
  // Rule:
  // To Watch -> Watching or Watched
  // Watching -> Watched or To Watch
  // Watched -> final (no transitions)
  const allowedTransitions = status === 'To Watch'
    ? ['Watching', 'Watched']
    : status === 'Watching'
    ? ['Watched', 'To Watch']
    : [];

  const isWatching = status === 'Watching';
  const isWatched = status === 'Watched';

  // Platform style helper
  const getPlatformClass = (plat) => {
    switch (plat) {
      case 'Netflix': return 'platform-netflix';
      case 'Prime Video': return 'platform-prime-video';
      case 'Hotstar': return 'platform-hotstar';
      case 'Theatre': return 'platform-theatre';
      default: return 'platform-other';
    }
  };

  // Card status class
  const getCardStatusClass = () => {
    if (status === 'To Watch') return 'card-towatch';
    if (status === 'Watching') return 'card-watching';
    if (status === 'Watched') return 'card-watched';
    return '';
  };

  return (
    <div className={`movie-card ${getCardStatusClass()}`} id={`movie-card-${_id}`}>
      {/* Top Header: Movie Code & Status Badge */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem'
        }}>
          <span className="badge badge-code" title="Auto-generated sequential code">
            {movieCode}
          </span>

          {status === 'To Watch' && (
            <span className="badge badge-towatch">
              <Clock size={12} /> To Watch
            </span>
          )}

          {status === 'Watching' && (
            <span className="badge badge-watching">
              <span className="pulse-dot"></span> Watching
            </span>
          )}

          {status === 'Watched' && (
            <span className="badge badge-watched">
              <CheckCircle size={12} /> Watched
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.25rem',
          color: '#ffffff',
          marginBottom: '0.5rem',
          wordBreak: 'break-word',
          lineHeight: 1.3
        }}>
          {title}
        </h3>

        {/* Metadata Chips: Genre, Release Year, Runtime */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.07)',
            color: '#e2e8f0',
            fontWeight: 600
          }}>
            {genre}
          </span>

          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Calendar size={12} /> {releaseYear}
          </span>

          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Clock size={12} /> {runtime}m ({formattedRuntime})
          </span>
        </div>

        {/* Platform & Priority & Rating Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 0.85rem',
          background: 'rgba(10, 14, 25, 0.6)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {/* Platform */}
          <span className={`badge ${getPlatformClass(platform)}`}>
            <Tv size={12} /> {platform}
          </span>

          {/* Priority */}
          <span
            className={`priority-pill priority-flame-${priority}`}
            title={`Priority ${priority} of 5 (${priority === 5 ? 'Highest' : priority >= 3 ? 'Medium' : 'Low'})`}
          >
            <Flame size={13} fill="currentColor" />
            <span>P{priority}</span>
            <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>
              {priority === 5 ? '(Max)' : ''}
            </span>
          </span>

          {/* Rating (if Watched) */}
          {isWatched && rating ? (
            <span className="rating-pill" title="Final Rating">
              <Star size={13} fill="#fbbf24" />
              <span>{rating}/10</span>
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isWatching ? 'Currently Viewing' : 'Unrated'}
            </span>
          )}
        </div>

        {/* Watched Date notice if available */}
        {isWatched && watchedDate && (
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <CheckCircle size={11} color="#10b981" />
            <span>Watched on {new Date(watchedDate).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: '0.85rem',
        marginTop: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        {/* Status Transition Selector */}
        <div style={{ position: 'relative', flex: 1 }}>
          {isWatched ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              padding: '0.4rem 0.6rem'
            }}>
              <Lock size={12} />
              <span>Final Status</span>
            </div>
          ) : (
            <div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.75rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ArrowRightCircle size={14} color="#818cf8" />
                  <span>Move to...</span>
                </span>
                <ChevronDown size={14} />
              </button>

              {/* Status Transition Dropdown (Strictly valid next statuses only) */}
              {isMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '105%',
                    left: 0,
                    right: 0,
                    background: '#131b2e',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 50,
                    overflow: 'hidden',
                    marginBottom: '0.35rem'
                  }}
                >
                  <div style={{
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    Allowed Next Statuses
                  </div>
                  {allowedTransitions.map(targetStatus => (
                    <button
                      key={targetStatus}
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onStatusTransition(movie, targetStatus);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.55rem 0.8rem',
                        background: 'transparent',
                        border: 'none',
                        color: targetStatus === 'Watched' ? '#6ee7b7' : targetStatus === 'Watching' ? '#fcd34d' : '#a5b4fc',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {targetStatus === 'Watching' && <PlayCircle size={14} />}
                      {targetStatus === 'Watched' && <CheckCircle size={14} />}
                      {targetStatus === 'To Watch' && <Clock size={14} />}
                      <span>{targetStatus}</span>
                      {targetStatus === 'Watched' && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: 'auto' }}>
                          (Rating required)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Edit and Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Edit Button */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(movie)}
            title="Edit movie details"
            style={{ padding: '0.45rem' }}
          >
            <Edit2 size={15} />
          </button>

          {/* Delete Button:
              Rule: A movie in Watching status cannot be deleted, and the backend must return an error in that case.
              For all other statuses, the frontend must ask for confirmation first, and the Delete button must be disabled where deletion is not allowed.
          */}
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onDeleteRequest(movie)}
            disabled={isWatching}
            title={isWatching ? 'Cannot delete movie while in "Watching" status' : 'Delete movie'}
            style={{
              padding: '0.45rem',
              cursor: isWatching ? 'not-allowed' : 'pointer'
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
