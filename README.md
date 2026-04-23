# StudyPulse

StudyPulse is a full MERN stack student progress tracker for grades, assignments, calendar planning, streaks, pomodoro sessions, goals, and analytics.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router v6
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Auth: JWT + bcryptjs
- Charts: Recharts
- Calendar: react-big-calendar + date-fns
- DnD: @hello-pangea/dnd
- Icons: lucide-react
- Notifications: react-hot-toast
- API client: axios
- State: React Context + useReducer

## Project Structure

```text
studypulse/
├── client/    # React app
├── server/    # Express API
└── README.md
```

## Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/studypulse
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Setup

1. Clone the repo
2. Install and run backend:
   - `cd server`
   - `npm install`
   - `npm run dev`
3. Install and run frontend:
   - `cd client`
   - `npm install`
   - `npm run dev`
4. Ensure MongoDB is running locally (or replace `MONGO_URI` with an Atlas URI)
5. Open [http://localhost:5173](http://localhost:5173)

## Seed Demo Data

In `server/`:

- `npm run seed`

Demo login:

- Email: `demo@studypulse.dev`
- Password: `password123`

## Core API Routes

- Auth: `/api/auth/*`
- Subjects: `/api/subjects/*`
- Grades: `/api/grades/*`
- Assignments: `/api/assignments/*`
- Study sessions: `/api/sessions/*`
- Goals: `/api/goals/*`
- Badges: `/api/badges/*`
- Calendar: `/api/calendar/*`
- Streak: `/api/streak/*`
