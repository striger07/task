# 📋 TaskFlow — Team Task Manager

![TaskFlow Header](https://via.placeholder.com/1200x400/1e293b/ffffff?text=TaskFlow+-+Team+Task+Manager)

A full-stack MERN (MongoDB, Express, React, Node.js) application designed for seamless team collaboration. It features role-based access control, project management, and a visual Kanban board for intuitive task tracking.

## ✨ Features

- 🔐 **Authentication** — Secure JWT-based signup and login system.
- 📁 **Project Management** — Create workspaces, manage project details, and invite team members.
- 🛡️ **Role-Based Access Control (RBAC)** — 
  - **Admins** can create, edit, and delete tasks.
  - **Members** can view and update the status of tasks assigned to them.
- ✅ **Task Management** — Create comprehensive tasks, assign them to members, set priority levels (Low, Medium, High), and assign due dates.
- 📋 **Kanban Board** — Visual drag-and-drop style task management across 4 columns: *To Do, In Progress, Review, Done*.
- 📊 **Dashboard Analytics** — High-level overview of active projects, task statistics, and overdue items.
- 🧑‍💻 **My Tasks** — Dedicated personal task view tailored to the logged-in user with dynamic status filters.

---

## 🗂 Project Structure

```text
team-task-manager/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database configurations
│   ├── controllers/          # API route logic (Auth, Projects, Tasks, Users)
│   ├── middleware/           # JWT Protection and Role validation
│   ├── models/               # Mongoose DB schemas
│   ├── routes/               # Express API routing definitions
│   └── server.js             # Main application entry point
│
└── frontend/                 # React UI
    ├── public/               # Static assets
    ├── src/
    │   ├── components/       # Reusable UI components (TaskCards, Modals, Layout)
    │   ├── context/          # React Context (Auth State)
    │   ├── pages/            # Application views (Dashboard, Projects, Login, etc.)
    │   └── utils/            # Axios API interceptors and helpers
    └── package.json
```

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)

### 1. Clone the repository
```bash
git clone https://github.com/striger07/task.git
cd task
```

### 2. Backend Setup
```bash
cd backend
npm install

# Environment Variables
cp .env.example .env
# Open the .env file and set your MONGO_URI and JWT_SECRET

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Environment Variables
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

---

## 🌐 Deployment (Railway)

This project is configured out-of-the-box for deployment on [Railway.app](https://railway.app/).

### Prerequisites for Deployment
- Make sure you do **NOT** commit `node_modules` to your Git repository. The project includes a root `.gitignore` to prevent this.

### Backend Deployment
1. Create a new Railway project → **Add Service** → **GitHub Repo**.
2. Navigate to Service Settings and set the **Root Directory** to `/backend`.
3. Add the following **Environment Variables**:
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = A strong random secret string
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = Your deployed frontend URL (for CORS)
4. Deploy the service. It uses `railway.toml` to automatically run `node server.js`.

### Frontend Deployment
1. In the same Railway project, add another service from the same GitHub Repo.
2. Navigate to Service Settings and set the **Root Directory** to `/frontend`.
3. Add the following **Environment Variable**:
   - `REACT_APP_API_URL` = Your deployed backend URL + `/api` (e.g., `https://backend-service.up.railway.app/api`)
4. Deploy the service. It uses the frontend `railway.toml` to run `npm run build` and serves it on port 3000 using `serve`.

---

## 🔌 API Documentation

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| **POST** | `/api/auth/register` | No | Register a new user |
| **POST** | `/api/auth/login` | No | Authenticate user & get token |
| **GET** | `/api/auth/me` | Yes | Get current user profile |
| **GET** | `/api/projects` | Yes | List user's projects |
| **POST** | `/api/projects` | Yes | Create a new project |
| **GET** | `/api/projects/:id` | Yes | Get project details & board |
| **PUT** | `/api/projects/:id` | Admin | Update project details |
| **DELETE** | `/api/projects/:id` | Owner | Delete a project |
| **POST** | `/api/projects/:id/members`| Admin | Add a member to a project |
| **DELETE** | `/api/projects/:id/members/:uid`| Admin | Remove a member |
| **GET** | `/api/tasks/dashboard` | Yes | Global dashboard statistics |
| **GET** | `/api/tasks/my` | Yes | User's assigned tasks |
| **GET** | `/api/tasks/project/:id` | Yes | Tasks for a specific project |
| **POST** | `/api/tasks` | Yes | Create a new task |
| **PUT** | `/api/tasks/:id` | Yes* | Update a task (*Members can only update status) |
| **DELETE** | `/api/tasks/:id` | Yes | Delete a task |

---

## 🎨 Tech Stack

- **Frontend**: React.js 18, React Router v6, TanStack Query, Axios, react-hot-toast, Pure CSS
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), JWT, bcryptjs, express-validator
- **Infrastructure**: Railway (Nixpacks build system)

---
*Developed with ❤️ for efficient team management.*
