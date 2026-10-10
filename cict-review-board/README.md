# CICT Review Board

Role-based web app where CICT students (BSCS / BSIS) share, preview and rate reviewers.
Stack: React (Vite) + Tailwind, Node/Express, MongoDB (Mongoose), Cloudinary.

## Run locally
```bash
# 1. Backend
cd server
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm install
npm run dev                 # http://localhost:5000/api/health

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## API
| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | no | studentId, name, password, program, yearLevel |
| POST | /api/auth/login | no | studentId, password -> JWT |
| GET | /api/auth/me | yes | current user |
| GET | /api/resources | yes | filters: program, yearLevel, courseCode, q, sort |
| POST | /api/resources | yes | multipart upload (field `file`) |
| POST | /api/resources/:id/vote | yes | `{ value: 1 or -1 }`, same value again = undo |

## Deploy
- **Backend (Render / Railway):** root dir `server`, build `npm install`, start `npm start`.
  Env vars: everything in `server/.env.example`, with `CLIENT_URL` = your Vercel URL (no trailing slash).
- **Frontend (Vercel / Netlify):** root dir `client`, build `npm run build`, output `dist`.
  Env var: `VITE_API_URL` = `https://<your-backend>/api`.
- **MongoDB Atlas:** Network Access -> allow `0.0.0.0/0` so the hosted backend can connect.
- **Cloudinary:** Settings -> Security -> enable "Allow delivery of PDF and ZIP files", otherwise PDF previews return 401.
