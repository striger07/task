# TaskFlow — Team Task Manager

A full-stack MERN application for team collaboration with role-based access control (Admin/Member), project management, and task tracking.

## 🚀 Features

- **Authentication** — JWT-based signup/login
- **Projects** — Create, manage, and invite team members
- **Role-Based Access** — Admins can create/edit/delete tasks; Members can update task status
- **Task Management** — Create tasks, assign to members, set priority and due dates
- **Kanban Board** — Visual task management across 4 columns (To Do, In Progress, Review, Done)
- **Dashboard** — Overview of projects, task stats, overdue items
- **My Tasks** — Personal task view with status filters

## 🗂 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── projectController.js   # CRUD + member management
│   │   ├── taskController.js      # CRUD + dashboard stats
│   │   └── userController.js      # Search, update profile
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect + role check
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx     # Sidebar + main layout
    │   │   │   └── Layout.css
    │   │   ├── tasks/
    │   │   │   ├── TaskCard.jsx   # Kanban card component
    │   │   │   └── TaskCard.css
    │   │   ├── Modal.jsx
    │   │   └── Modal.css
    │   ├── context/
    │   │   └── AuthContext.jsx    # Auth state + JWT handling
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── ProjectDetailPage.jsx  # Board + List + Members tabs
    │   │   └── MyTasksPage.jsx
    │   ├── utils/
    │   │   └── api.js             # Axios instance + interceptors
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    └── package.json
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

## 🌐 Deployment on Railway

### Backend
1. Create new Railway project → Add service → GitHub repo
2. Set root directory: `backend`
3. Add environment variables:
   - `MONGO_URI` — MongoDB Atlas connection string
   - `JWT_SECRET` — Random secret key
   - `NODE_ENV=production`
   - `CLIENT_URL` — Your frontend Railway URL
4. Deploy

### Frontend
1. Add another service in same Railway project
2. Set root directory: `frontend`
3. Add environment variables:
   - `REACT_APP_API_URL` — Your backend Railway URL + `/api`
4. Build command: `npm run build`
5. Start command: `npx serve -s build`

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/projects | Yes | My projects |
| POST | /api/projects | Yes | Create project |
| GET | /api/projects/:id | Yes | Project detail |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Owner | Delete project |
| POST | /api/projects/:id/members | Admin | Add member |
| DELETE | /api/projects/:id/members/:uid | Admin | Remove member |
| GET | /api/tasks/dashboard | Yes | Dashboard stats |
| GET | /api/tasks/my | Yes | My tasks |
| GET | /api/tasks/project/:id | Yes | Project tasks |
| POST | /api/tasks | Yes | Create task |
| PUT | /api/tasks/:id | Yes* | Update task |
| DELETE | /api/tasks/:id | Yes* | Delete task |

*Members can only update status of tasks assigned to them

## 🎨 Tech Stack

- **Frontend**: React 18, React Router v6, TanStack Query, Axios, react-hot-toast
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, express-validator
- **Database**: MongoDB
- **Deployment**: Railway
