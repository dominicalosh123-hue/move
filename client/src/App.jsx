import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import RatingPromptModal from './components/RatingPromptModal';
import WatchNextModal from './components/WatchNextModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Pagination from './components/Pagination';
import Toast from './components/Toast';
import { movieApi } from './api/movieApi';
import { Film, Plus, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Movie list and pagination state
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMovies: 0,
    limit: 6
  });
  const [loading, setLoading] = useState(true);

  // Statistics state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [isSubmittingMovie, setIsSubmittingMovie] = useState(false);

  const [ratingModalMovie, setRatingModalMovie] = useState(null);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  const [watchNextMovie, setWatchNextMovie] = useState(null);
  const [isWatchNextLoading, setIsWatchNextLoading] = useState(false);

  const [deletingMovie, setDeletingMovie] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genreFilter]);

  // Fetch Stats from backend API
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await movieApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Movies from backend API
  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await movieApi.getMovies({
        status: statusFilter,
        genre: genreFilter,
        search: debouncedSearch,
        page: currentPage
      });

      if (res.success && res.data) {
        setMovies(res.data.movies || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
      addToast(err.message || 'Failed to fetch movies from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, genreFilter, debouncedSearch, currentPage, addToast]);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Refresh both movies and stats
  const refreshAll = useCallback(() => {
    loadMovies();
    loadStats();
  }, [loadMovies, loadStats]);

  // Open Add Movie Modal
  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Movie Modal
  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setIsAddEditModalOpen(true);
  };

  // Handle Save (Add or Edit)
  const handleSaveMovie = async (movieData, id) => {
    setIsSubmittingMovie(true);
    try {
      if (id) {
        // Edit movie
        const res = await movieApi.editMovie(id, movieData);
        addToast(res.message || 'Movie updated successfully');
      } else {
        // Add movie
        const res = await movieApi.addMovie(movieData);
        addToast(res.message || 'Movie added to watchlist');
      }
      setIsAddEditModalOpen(false);
      refreshAll();
    } catch (err) {
      // Re-throw so MovieModal can show duplicate 409 or validation error on the form
      throw err;
    } finally {
      setIsSubmittingMovie(false);
    }
  };

  // Handle Status Transition
  const handleStatusTransition = async (movie, targetStatus) => {
    // If moving to Watched, rating (1-10) is mandatory: open rating prompt modal
    if (targetStatus === 'Watched') {
      setRatingModalMovie(movie);
      return;
    }

    // Moving to 'Watching' or 'To Watch'
    try {
      const res = await movieApi.updateStatus(movie._id, { status: targetStatus });
      addToast(res.message || `Status updated to ${targetStatus}`);
      refreshAll();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Handle Watched Rating Submission
  const handleConfirmWatched = async (movie, rating) => {
    setIsRatingSubmitting(true);
    try {
      const res = await movieApi.updateStatus(movie._id, {
        status: 'Watched',
        rating: Number(rating)
      });
      addToast(res.message || 'Marked as Watched with rating!');
      setRatingModalMovie(null);
      refreshAll();
    } catch (err) {
      addToast(err.message || 'Failed to mark as Watched', 'error');
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteRequest = (movie) => {
    // Extra safety guard
    if (movie.status === 'Watching') {
      addToast('Cannot delete a movie currently in Watching status', 'error');
      return;
    }
    setDeletingMovie(movie);
  };

  const handleConfirmDelete = async (movie) => {
    setIsDeleting(true);
    try {
      const res = await movieApi.deleteMovie(movie._id);
      addToast(res.message || 'Movie removed from watchlist');
      setDeletingMovie(null);
      refreshAll();
    } catch (err) {
      addToast(err.message || 'Failed to delete movie', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle "What should I watch next?"
  const handleWatchNext = async () => {
    setIsWatchNextLoading(true);
    try {
      const res = await movieApi.getWatchNext();
      if (res.success && res.data) {
        setWatchNextMovie(res.data);
      }
    } catch (err) {
      if (err.status === 404 || err.message?.includes('No movies found')) {
        addToast("No movies found in your 'To Watch' list to recommend. Add some movies first!", 'error');
      } else {
        addToast(err.message || 'Could not fetch recommendation', 'error');
      }
    } finally {
      setIsWatchNextLoading(false);
    }
  };

  // "Start Watching" triggered directly from WatchNextModal
  const handleStartWatchingFromRecommendation = async (movie) => {
    try {
      const res = await movieApi.updateStatus(movie._id, { status: 'Watching' });
      addToast(`Now Watching: ${movie.title}! Enjoy the movie.`);
      refreshAll();
    } catch (err) {
      addToast(err.message || 'Failed to start watching', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onWatchNext={handleWatchNext}
        isWatchNextLoading={isWatchNextLoading}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1 }}>
        {/* Statistics Dashboard */}
        <StatsDashboard stats={stats} loading={statsLoading} />

        {/* Filters and Search Bar */}
        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalResults={pagination.totalMovies}
        />

        {/* Movies Grid / Empty States */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 1rem',
            color: 'var(--text-muted)'
          }}>
            <RefreshCw size={36} className="pulse-dot" style={{ margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="glass-panel" style={{
            textAlign: 'center',
            padding: '4.5rem 1.5rem',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Film size={32} />
            </div>

            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              No Movies Found
            </h3>

            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              maxWidth: '420px',
              margin: '0 auto 1.5rem auto'
            }}>
              {statusFilter !== 'All' || genreFilter !== 'All' || searchQuery
                ? 'Try adjusting your filters or search keywords to find what you are looking for.'
                : 'Your watchlist is currently empty. Start planning your movie marathon by adding your first title!'}
            </p>

            <button
              className="btn btn-primary"
              onClick={handleOpenAddModal}
            >
              <Plus size={18} />
              <span>Add a Movie</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="movies-grid">
              {movies.map(movie => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onEdit={handleOpenEditModal}
                  onDeleteRequest={handleDeleteRequest}
                  onStatusTransition={handleStatusTransition}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={newPage => setCurrentPage(newPage)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem 0',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: '3rem'
      }}>
        <div className="app-container">
          CineLog • Full MERN Stack Movie Watchlist Manager • MongoDB Atlas + Express + React + Node.js
        </div>
      </footer>

      {/* Add / Edit Movie Modal */}
      <MovieModal
        isOpen={isAddEditModalOpen}
        initialMovie={editingMovie}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleSaveMovie}
        isSubmitting={isSubmittingMovie}
      />

      {/* Rating Prompt Modal (Mandatory on transition to Watched) */}
      <RatingPromptModal
        isOpen={Boolean(ratingModalMovie)}
        movie={ratingModalMovie}
        onClose={() => setRatingModalMovie(null)}
        onConfirm={handleConfirmWatched}
        isSubmitting={isRatingSubmitting}
      />

      {/* "What Should I Watch Next?" Recommendation Modal */}
      <WatchNextModal
        isOpen={Boolean(watchNextMovie)}
        movie={watchNextMovie}
        onClose={() => setWatchNextMovie(null)}
        onStartWatching={handleStartWatchingFromRecommendation}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingMovie)}
        movie={deletingMovie}
        onClose={() => setDeletingMovie(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
