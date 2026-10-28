import React from 'react';
import { Film, Clock, Star, Trophy, Play, CheckCircle2, ListTodo } from 'lucide-react';

export default function StatsDashboard({ stats, loading }) {
  const statusCounts = stats?.statusCounts || { toWatch: 0, watching: 0, watched: 0, total: 0 };
  const totalHours = stats?.totalHoursWatched ?? 0;
  const avgRating = stats?.avgRating ?? 0;
  const topGenre = stats?.topWatchedGenre || 'N/A';

  return (
    <div className="stats-grid">
      {/* 1. Status Breakdown Card */}
      <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Watchlist Status
          </span>
          <div style={{
            padding: '0.35rem',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8'
          }}>
            <Film size={18} />
          </div>
        </div>

        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>
          {statusCounts.total}{' '}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total</span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-towatch" style={{ fontSize: '0.72rem' }}>
            <ListTodo size={11} /> To Watch: {statusCounts.toWatch}
          </span>
          <span className="badge badge-watching" style={{ fontSize: '0.72rem' }}>
            <span className="pulse-dot" style={{ width: '5px', height: '5px' }}></span> Watching: {statusCounts.watching}
          </span>
          <span className="badge badge-watched" style={{ fontSize: '0.72rem' }}>
            <CheckCircle2 size={11} /> Watched: {statusCounts.watched}
          </span>
        </div>
      </div>

      {/* 2. Total Hours Watched */}
      <div className="stat-card" style={{ borderLeft: '4px solid #06b6d4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Hours Watched
          </span>
          <div style={{
            padding: '0.35rem',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#22d3ee'
          }}>
            <Clock size={18} />
          </div>
        </div>

        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
          {totalHours}{' '}
          <span style={{ fontSize: '1rem', color: '#22d3ee', fontWeight: 600 }}>hrs</span>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {stats?.totalMinutesWatched ? `${stats.totalMinutesWatched} total minutes completed` : 'No movies completed yet'}
        </p>
      </div>

      {/* 3. Average Rating */}
      <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Average Rating
          </span>
          <div style={{
            padding: '0.35rem',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24'
          }}>
            <Star size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24' }}>
            {avgRating > 0 ? avgRating : '—'}
          </span>
          {avgRating > 0 && (
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 10</span>
          )}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {statusCounts.watched > 0
            ? `Calculated across ${statusCounts.watched} rated movie${statusCounts.watched > 1 ? 's' : ''}`
            : 'Rates apply to watched films'}
        </p>
      </div>

      {/* 4. Top Watched Genre */}
      <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Top Watched Genre
          </span>
          <div style={{
            padding: '0.35rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399'
          }}>
            <Trophy size={18} />
          </div>
        </div>

        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {topGenre}
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Most popular completed category
        </p>
      </div>
    </div>
  );
}
