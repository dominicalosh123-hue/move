const API_BASE = '/api/movies';

/**
 * Handle API responses and throw standardized error objects
 */
async function handleResponse(response) {
  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error(`Server returned status ${response.status}`);
  }

  if (!response.ok || (json && json.success === false)) {
    const error = new Error(json?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = json?.data;
    throw error;
  }

  return json;
}

export const movieApi = {
  // Fetch movies with filters, search, and pagination
  async getMovies({ status, genre, search, page = 1 } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (genre && genre !== 'All') params.append('genre', genre);
    if (search && search.trim()) params.append('search', search.trim());
    if (page) params.append('page', page);

    const url = `${API_BASE}?${params.toString()}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // Get statistics
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res);
  },

  // Watch next recommendation
  async getWatchNext() {
    const res = await fetch(`${API_BASE}/watch-next`);
    return handleResponse(res);
  },

  // Add a new movie
  async addMovie(movieData) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieData)
    });
    return handleResponse(res);
  },

  // Edit movie
  async editMovie(id, movieData) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movieData)
    });
    return handleResponse(res);
  },

  // Update movie status (and rating if Watched)
  async updateStatus(id, { status, rating }) {
    const payload = { status };
    if (rating !== undefined && rating !== null) {
      payload.rating = rating;
    }

    const res = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Delete movie
  async deleteMovie(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
