# 📋 TaskFlow — Team Task Manager

> A full-stack **MERN** application for team collaboration with role-based access control, project management, and a visual Kanban board.

**Live Demo:** `[your-frontend-url].up.railway.app` &nbsp;|&nbsp; **Backend API:** `[your-backend-url].up.railway.app`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure signup/login with token stored in `localStorage` |
| 🏗 Projects | Create projects, invite members, manage team workspaces |
| 🛡 RBAC | **Admins** manage tasks; **Members** update their own task status |
| ✅ Task Tracking | Priority levels (`low / medium / high / critical`), due dates, assignees |
| 📋 Kanban Board | Visual 4-column board: *To Do → In Progress → Review → Done* |
| 📊 Dashboard | Overview of active projects, task counts, and overdue items |
| 👤 My Tasks | Personal filtered task view for the logged-in user |
| 🌐 Global Error Handling | 401 auto-logout, toast notifications, server error middleware |

---

## 🗂 Project Structure

```
team-task-manager/
├── .gitignore                     # Excludes node_modules, .env, build/
│
├── backend/                       # Node.js + Express REST API
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js      # register, login, getMe
│   │   ├── projectController.js   # CRUD + member management
│   │   ├── taskController.js      # CRUD + dashboard stats
│   │   └── userController.js      # Search users, update profile
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + role-based guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js             # Embedded members with roles
│   │   └── Task.js                # isOverdue virtual field
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── railway.toml               # Railway deploy config
│   ├── package.json
│   └── server.js                  # Entry point, CORS, routes
│
└── frontend/                      # React 18 SPA
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx     # Sidebar + outlet wrapper
    │   │   │   └── Layout.css
    │   │   ├── tasks/
    │   │   │   ├── TaskCard.jsx   # Kanban card component
    │   │   │   └── TaskCard.css
    │   │   ├── Modal.jsx          # Reusable modal wrapper
    │   │   └── Modal.css
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state, login/logout handlers
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx  # Board + List + Members tabs
    │   │   └── MyTasksPage.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios instance + JWT interceptor
    │   ├── App.jsx                # Routes (public + private guards)
    │   └── index.js
    ├── railway.toml               # Railway deploy config
    └── package.json
```

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** cluster → [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

### 1. Clone the repository
```bash
git clone https://github.com/striger07/task.git
cd task
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# backend/.env

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
NODE_ENV=development
CLIENT_URL=http://localhost:3000
PORT=5000
```

Start the backend dev server:
```bash
npm run dev
# Server running on http://localhost:5000
```

Verify it's working:
```bash
curl http://localhost:5000/
# → {"message":"Team Task Manager API running"}
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
# frontend/.env

REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm start
# App running on http://localhost:3000
```

> Both servers must be running simultaneously for the app to work locally.

---

## 🌐 Deployment on Railway

### Step 0 — Prerequisites
- Make sure **`node_modules` is NOT committed** to git. The root `.gitignore` in this repo handles this.
- Push your latest code to GitHub before deploying.

---

### Backend Service

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo** → select `striger07/task`.
2. In **Service Settings → Source** → set **Root Directory** to `backend`.
3. Go to **Variables** tab and add:

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | `mongodb+srv://...` (your Atlas URI) |
   | `JWT_SECRET` | A strong random string (32+ chars) |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | Your **frontend** Railway URL (e.g. `https://sweet-stillness.up.railway.app`) |

4. Railway auto-detects `railway.toml` and runs `node server.js`. **Deploy.**
5. Copy your backend public URL (e.g. `https://hearty-optimism.up.railway.app`).

---

### Frontend Service

1. In the same Railway project → **New Service** → same GitHub repo.
2. In **Service Settings → Source** → set **Root Directory** to `frontend`.
3. Go to **Variables** tab and add:

   | Variable | Value |
   |---|---|
   | `REACT_APP_API_URL` | `https://<your-backend-url>.up.railway.app/api` |

4. Railway auto-detects `railway.toml` and runs `npm run build` then `npx serve -s build`. **Deploy.**

> ⚠️ **Critical:** `REACT_APP_API_URL` must be the full backend URL + `/api`. If this is missing or points to `localhost`, the frontend will not be able to reach the backend in production.

---

## 🔌 API Reference

All protected routes require the header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register (name, email, password≥6) |
| `POST` | `/api/auth/login` | No | Login → returns JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

### Projects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | ✅ | List all projects user belongs to |
| `POST` | `/api/projects` | ✅ | Create a new project |
| `GET` | `/api/projects/:id` | ✅ | Get project details |
| `PUT` | `/api/projects/:id` | 🛡 Admin | Update project name/description |
| `DELETE` | `/api/projects/:id` | 🔑 Owner | Delete project |
| `POST` | `/api/projects/:id/members` | 🛡 Admin | Add member by email |
| `DELETE` | `/api/projects/:id/members/:uid` | 🛡 Admin | Remove a member |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tasks/dashboard` | ✅ | Dashboard stats (counts, overdue) |
| `GET` | `/api/tasks/my` | ✅ | Tasks assigned to current user |
| `GET` | `/api/tasks/project/:id` | ✅ | All tasks for a project |
| `POST` | `/api/tasks` | ✅ | Create task (title + project required) |
| `PUT` | `/api/tasks/:id` | ✅ * | Update task fields |
| `DELETE` | `/api/tasks/:id` | ✅ | Delete task |

> \* Members can only update `status` on tasks assigned to them. Admins can update all fields.

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/search?q=<email>` | ✅ | Search users by email (for invites) |
| `PUT` | `/api/users/profile` | ✅ | Update own profile |

---

## 🎨 Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| React Router DOM | v6 | Client-side routing |
| TanStack Query | v5 | Server state & caching |
| Axios | 1.x | HTTP client with interceptors |
| react-hot-toast | 2.x | Toast notifications |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Express | 4.x | Web framework |
| Mongoose | 7.x | MongoDB ODM |
| jsonwebtoken | 9.x | JWT auth |
| bcryptjs | 2.x | Password hashing |
| express-validator | 7.x | Input validation |
| cors | 2.x | CORS middleware |
| dotenv | 16.x | Environment variable loading |

### Infrastructure
- **Database:** MongoDB Atlas
- **Deployment:** Railway (Nixpacks build)
- **CI/CD:** Auto-deploy on push to `main`

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)
```env
MONGO_URI=           # MongoDB Atlas connection string
JWT_SECRET=          # Secret for signing JWTs (keep this private!)
NODE_ENV=            # development | production
CLIENT_URL=          # Frontend URL for CORS whitelist
PORT=                # Optional — defaults to 5000
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=   # Full backend API URL e.g. https://xxx.railway.app/api
```

> ⚠️ Never commit `.env` files to git. Use Railway's **Variables** dashboard for production secrets.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `npm ci` fails on Railway | Ensure `node_modules` is not tracked in git (`git ls-files \| grep node_modules`) |
| Frontend can't reach backend | Check `REACT_APP_API_URL` is set in Railway Variables (not just `.env`) |
| CORS error in browser | Set `CLIENT_URL` in backend Railway Variables to match your frontend URL exactly |
| MongoDB connection refused | Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access |
| 401 on all API calls | JWT_SECRET mismatch between local and deployed environments |

---

*Built with ❤️ — TaskFlow helps teams stay organized and focused.*
