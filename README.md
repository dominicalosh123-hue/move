# 🎬 CineLog — Movie Watchlist Manager (MERN Stack)

A full-stack Movie Watchlist Manager web application built with the **MERN Stack** (**MongoDB Atlas**, **Express.js**, **React.js**, **Node.js**). Designed for movie lovers to plan what to watch, track what they are currently viewing, rate finished titles, and get smart movie recommendations.

---

## 🌟 Key Features & Requirements Met

### 1. ➕ Add Movie & Validation
- **Fields:** Title, Genre, Release Year, Runtime (minutes), Platform, Priority (1 to 5).
- **Validation (Frontend & Backend):**
  - **Release Year:** Must be between 1950 and the current year.
  - **Runtime:** Must be between 30 and 300 minutes.
  - **Priority:** 1 to 5 (5 is the highest priority).
- **Duplicate Rule (409 Conflict):** Adding the same Title and Release Year (case-insensitive) is prevented. The backend returns status `409`, and the error is clearly displayed directly on the modal form.

### 2. 🏷️ Auto-generated Movie Code
- Generated on the backend in the format: `MV-<release year>-<3-digit sequence>` (e.g. `MV-2019-001`, `MV-2019-002`).
- The sequence increases atomically per release year.
- The client cannot set or modify it.

### 3. 🔄 Status Workflow
- Every new movie begins with the status **"To Watch"**.
- Allowed status transitions:
  - `To Watch` ➔ `Watching` or `Watched`
  - `Watching` ➔ `Watched` or `To Watch`
  - `Watched` ➔ **Final status** (terminal state, cannot be changed).
- The backend rejects any invalid transition with an HTTP `400` error.
- The frontend card displays **only the valid next statuses** in the transition menu.

### 4. ⭐ Mandatory Rating on Watched
- Transitioning to `Watched` requires a mandatory rating between **1 and 10**.
- The backend automatically stores the `watchedDate` timestamp (`new Date()`).
- Any rating submitted for a movie not in `Watched` status is rejected by the backend.
- Ratings can be edited later **only** for `Watched` movies.

### 5. 🛡️ Delete Protection Rule
- Movies in **"Watching"** status **cannot be deleted**. The backend rejects deletion with an HTTP `400` error.
- The frontend disables the Delete button for watching movies with a helpful notice.
- For all other statuses, a confirmation dialog appears before deletion.

### 6. 🔍 Backend-Driven Search, Filters & Pagination
- **Filter by Status:** `All`, `To Watch`, `Watching`, `Watched`
- **Filter by Genre:** `All`, `Action`, `Comedy`, `Drama`, `Horror`, `Sci-Fi`, `Romance`, `Thriller`
- **Search by Title:** Real-time debounced case-insensitive regex search.
- **Pagination:** Exactly **6 movies per page** with total page count returned by the backend.
- **Priority Sorting:** Movies in `To Watch` status are prioritized (high to low) first.

### 7. 🍿 "What should I watch next?"
- Clicking the **"What should I watch next?"** button calls the backend recommendation endpoint (`/api/movies/watch-next`).
- The algorithm returns the `To Watch` movie with the **highest priority**.
- If there is a tie, it selects the movie with the **shortest runtime**.
- If no movies remain in "To Watch", returns a status `404` with a clean notification.

### 8. 📊 Real-Time Statistics Dashboard
Calculated via MongoDB aggregation (`/api/movies/stats`):
- **Status Breakdown:** Total movies in `To Watch`, `Watching`, `Watched`, and total count.
- **Total Hours Watched:** Sum of runtime of all `Watched` movies in hours (rounded to 1 decimal place).
- **Average Rating:** Average rating of `Watched` movies (rounded to 1 decimal place).
- **Top Watched Genre:** The genre with the most finished movies.
- **Auto-Refresh:** Stats automatically update after any add, edit, status transition, or delete.

---

## 🚀 Getting Started

### 1. Configure MongoDB Atlas

Open `server/.env` and insert your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/movie_watchlist?retryWrites=true&w=majority
NODE_ENV=development
```

> **Note:** If `MONGODB_URI` is not provided or if Atlas is temporarily offline during testing, the server automatically initializes an in-memory MongoDB instance so you can test immediately without setup blockers!

---

### 2. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

The API will be live at: `http://localhost:5000/api/movies`

#### (Optional) Seed Sample Data:
```bash
npm run seed
```

---

### 3. Start the Frontend React App

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The application will be accessible at: `http://localhost:3000` (or `http://localhost:5173`)

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/movies` | Get movies (filters, search, 6 per page) | `200` |
| `POST` | `/api/movies` | Add new movie (validates year, runtime, duplicates) | `201`, `400`, `409` |
| `GET` | `/api/movies/watch-next` | Recommend highest priority / shortest runtime | `200`, `404` |
| `GET` | `/api/movies/stats` | Aggregated metrics dashboard | `200` |
| `GET` | `/api/movies/:id` | Get single movie details | `200`, `404` |
| `PUT` | `/api/movies/:id` | Edit movie (Code & Year locked) | `200`, `400`, `404`, `409` |
| `PATCH`| `/api/movies/:id/status`| Transition status (Mandatory rating for Watched)| `200`, `400`, `404` |
| `DELETE`| `/api/movies/:id` | Delete movie (Watching status forbidden) | `200`, `400`, `404` |

All responses return a standard JSON structure:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```
