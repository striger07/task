import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const icons = {
  dashboard: '⬡',
  projects: '◫',
  tasks: '✦',
  logout: '⏻',
  menu: '☰',
  close: '✕'
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { to: '/projects', icon: icons.projects, label: 'Projects' },
    { to: '/my-tasks', icon: icons.tasks, label: 'My Tasks' },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">TaskFlow</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>{icons.close}</button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">{icons.logout}</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>{icons.menu}</button>
          <div className="topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search your task here..." />
          </div>
          <div className="topbar-actions">
            <button className="bell-btn">
              🔔
              <span className="bell-badge"></span>
            </button>
            <div className="user-profile">
              <div className="user-meta">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">Member</div>
              </div>
              <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            </div>
          </div>
        </header>
        <div className="page-wrapper page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
