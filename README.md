# QuickShow — Movie Ticket Booking

Full-stack movie booking app: React (Vite) frontend, Express API, MongoDB.

## Features

- Browse movies, theaters, and upcoming releases
- User signup/login with OTP (client-side demo OTP)
- Seat selection and booking with payment flow
- Booking history on profile

## Local development

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

### 1. Install dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Environment

Copy examples and adjust if needed:

```bash
# Frontend uses .env.development (VITE_API_URL=http://localhost:5000)
cp .env.example .env.development

# Backend
cp backend/.env.example backend/.env
```

### 3. Run

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**

```bash
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000/health  

## Production (Render + MongoDB Atlas)

### MongoDB Atlas (required for live DB)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Database user + password.
3. Network Access → allow `0.0.0.0/0` (or Render IPs).
4. Copy connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/movieproject?retryWrites=true&w=majority`

### GitHub

```bash
git init
git add .
git commit -m "QuickShow movie booking app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quickshow.git
git push -u origin main
```

### Render (single service — API + built frontend)

1. [render.com](https://render.com) → **New** → **Blueprint** (or **Web Service** from repo).
2. Connect your GitHub repo.
3. If using Blueprint, `render.yaml` is applied automatically.
4. Manual setup:
   - **Build command:** `npm install && npm run build && cd backend && npm install`
   - **Start command:** `cd backend && npm start`
   - **Health check path:** `/health`
5. **Required** environment variable (without this, deploy fails):
   - `MONGODB_URI` = your MongoDB Atlas connection string  
     Example: `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/movieproject?retryWrites=true&w=majority`
   - `NODE_ENV` = `production` (set by Blueprint)
6. Deploy. Live URL: `https://your-app.onrender.com`

### Render deploy failed?

1. **Set `MONGODB_URI`** on the `quickshow` web service → **Environment** → add variable → save → **Manual Deploy**.
2. In **MongoDB Atlas** → **Network Access** → allow `0.0.0.0/0`.
3. Push latest code, then **Blueprint → Manual sync** (or redeploy the web service).
4. Check **Logs** on the failed deploy for `MONGODB_URI` or `dist/index.html` errors.

Signup, login, and bookings use the real API and MongoDB on Render.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/signup` | Create account |
| POST | `/api/login` | Login |
| POST | `/api/create-booking` | Create booking |
| GET | `/api/user-bookings/:login_name` | User bookings |
| POST | `/api/get-show-bookings` | Seats booked for a show |

## Project structure

```
├── src/                 # React frontend
├── backend/             # Express API
│   ├── routes/
│   ├── models/
│   └── server.js
├── render.yaml          # Render deployment
└── package.json
```

## License

MIT
