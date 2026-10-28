import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Film, Lock, Star } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];

export default function MovieModal({
  isOpen,
  onClose,
  onSubmit,
  initialMovie = null,
  isSubmitting = false
}) {
  const isEditing = Boolean(initialMovie && initialMovie._id);
  const currentYear = new Date().getFullYear();

  // Form states
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Action');
  const [releaseYear, setReleaseYear] = useState(currentYear);
  const [runtime, setRuntime] = useState(120);
  const [platform, setPlatform] = useState('Netflix');
  const [priority, setPriority] = useState(3);
  const [rating, setRating] = useState(8);

  // Field errors & general form duplicate error (409)
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Pre-fill fields on open / movie change
  useEffect(() => {
    if (initialMovie) {
      setTitle(initialMovie.title || '');
      setGenre(initialMovie.genre || 'Action');
      setReleaseYear(initialMovie.releaseYear || currentYear);
      setRuntime(initialMovie.runtime || 120);
      setPlatform(initialMovie.platform || 'Netflix');
      setPriority(initialMovie.priority || 3);
      setRating(initialMovie.rating || 8);
    } else {
      setTitle('');
      setGenre('Action');
      setReleaseYear(currentYear);
      setRuntime(120);
      setPlatform('Netflix');
      setPriority(3);
      setRating(8);
    }
    setErrors({});
    setServerError('');
  }, [initialMovie, isOpen, currentYear]);

  if (!isOpen) return null;

  // Frontend validation
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!genre) {
      newErrors.genre = 'Genre is required';
    }

    const yearNum = Number(releaseYear);
    if (!releaseYear || isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
      newErrors.releaseYear = `Release Year must be between 1950 and ${currentYear}`;
    }

    const runtimeNum = Number(runtime);
    if (!runtime || isNaN(runtimeNum) || runtimeNum < 30 || runtimeNum > 300) {
      newErrors.runtime = 'Runtime must be between 30 and 300 minutes';
    }

    if (!platform) {
      newErrors.platform = 'Platform is required';
    }

    const priorityNum = Number(priority);
    if (!priority || isNaN(priorityNum) || priorityNum < 1 || priorityNum > 5) {
      newErrors.priority = 'Priority must be between 1 and 5';
    }

    if (isEditing && initialMovie?.status === 'Watched') {
      const ratingNum = Number(rating);
      if (!rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
        newErrors.rating = 'Rating must be between 1 and 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    const payload = {
      title: title.trim(),
      genre,
      runtime: Number(runtime),
      platform,
      priority: Number(priority)
    };

    if (!isEditing) {
      payload.releaseYear = Number(releaseYear);
    } else if (initialMovie?.status === 'Watched') {
      payload.rating = Number(rating);
    }

    try {
      await onSubmit(payload, isEditing ? initialMovie._id : null);
    } catch (err) {
      // Show duplicate error or validation error message directly on the form
      setServerError(err.message || 'An error occurred while saving the movie.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Film size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>
                {isEditing ? 'Edit Movie' : 'Add Movie to Watchlist'}
              </h2>
              {isEditing && (
                <span className="badge badge-code" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                  {initialMovie.movieCode}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.3rem',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Server Error Alert (Duplicate 409 or other server rejection) */}
        {serverError && (
          <div className="form-alert-error" id="form-server-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Action Rejected:</strong> {serverError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="movie-title">
              Movie Title <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="movie-title"
              type="text"
              className="form-input"
              placeholder="e.g. Interstellar, The Dark Knight"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: null }));
              }}
              required
            />
            {errors.title && <div className="form-error"><AlertCircle size={13} /> {errors.title}</div>}
          </div>

          {/* Genre & Platform Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="movie-genre">
                Genre <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <select
                id="movie-genre"
                className="form-select"
                value={genre}
                onChange={e => setGenre(e.target.value)}
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.genre && <div className="form-error"><AlertCircle size={13} /> {errors.genre}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="movie-platform">
                Platform <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <select
                id="movie-platform"
                className="form-select"
                value={platform}
                onChange={e => setPlatform(e.target.value)}
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.platform && <div className="form-error"><AlertCircle size={13} /> {errors.platform}</div>}
            </div>
          </div>

          {/* Release Year & Runtime Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Release Year: 1950 to current year. Uneditable on edit mode */}
            <div className="form-group">
              <label className="form-label" htmlFor="movie-release-year" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Release Year <span style={{ color: '#f43f5e' }}>*</span></span>
                {isEditing && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Lock size={10} /> Locked
                  </span>
                )}
              </label>
              <input
                id="movie-release-year"
                type="number"
                className="form-input"
                min="1950"
                max={currentYear}
                value={releaseYear}
                onChange={e => {
                  setReleaseYear(e.target.value);
                  if (errors.releaseYear) setErrors(prev => ({ ...prev, releaseYear: null }));
                }}
                disabled={isEditing}
                style={isEditing ? { opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.3)' } : {}}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Allowed: 1950 - {currentYear}
              </span>
              {errors.releaseYear && <div className="form-error"><AlertCircle size={13} /> {errors.releaseYear}</div>}
            </div>

            {/* Runtime: 30 to 300 minutes */}
            <div className="form-group">
              <label className="form-label" htmlFor="movie-runtime">
                Runtime (minutes) <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                id="movie-runtime"
                type="number"
                className="form-input"
                min="30"
                max="300"
                placeholder="e.g. 148"
                value={runtime}
                onChange={e => {
                  setRuntime(e.target.value);
                  if (errors.runtime) setErrors(prev => ({ ...prev, runtime: null }));
                }}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Allowed: 30 - 300 mins
              </span>
              {errors.runtime && <div className="form-error"><AlertCircle size={13} /> {errors.runtime}</div>}
            </div>
          </div>

          {/* Priority (1 to 5) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Priority Level <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: priority === 5 ? '#f43f5e' : priority >= 3 ? '#fbbf24' : '#94a3b8'
              }}>
                {priority} / 5 {priority === 5 ? '★ Highest Priority' : priority === 1 ? '• Low' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPriority(lvl)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: priority === lvl ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                    background: priority === lvl ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 21, 35, 0.6)',
                    color: priority === lvl ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
            {errors.priority && <div className="form-error"><AlertCircle size={13} /> {errors.priority}</div>}
          </div>

          {/* Rating (ONLY shown and editable if movie is already in Watched status during edit) */}
          {isEditing && initialMovie?.status === 'Watched' && (
            <div className="form-group" style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="form-label" style={{ marginBottom: 0, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Star size={15} fill="#fbbf24" /> Watched Movie Rating (1 - 10)
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>
                  {rating} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>1 (Poor)</span>
                <span>5 (Average)</span>
                <span>10 (Masterpiece)</span>
              </div>
              {errors.rating && <div className="form-error"><AlertCircle size={13} /> {errors.rating}</div>}
            </div>
          )}

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-movie-form-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Movie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
