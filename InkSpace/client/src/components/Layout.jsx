import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Feather, Search, PenLine, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const signOut = () => { logout(); navigate('/') }

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/"><span className="brand-mark"><Feather size={19}/></span>InkSpace</Link>
        <nav className="nav">
          <NavLink to="/"><Search size={17}/> Explore</NavLink>
          {user && <NavLink to="/write"><PenLine size={17}/> Write</NavLink>}
          {user && <NavLink to="/dashboard"><LayoutDashboard size={17}/> Dashboard</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link className="avatar-link" to={`/author/${user.username}`}>
                <img className="avatar xs" src={user.avatarUrl} alt="" />
                <span>{user.displayName}</span>
              </Link>
              <button className="icon-btn" onClick={signOut} title="Sign out"><LogOut size={18}/></button>
            </>
          ) : (
            <>
              <Link className="text-link" to="/login">Sign in</Link>
              <Link className="button small" to="/register">Get started</Link>
            </>
          )}
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <Link className="brand muted" to="/"><Feather size={18}/> InkSpace</Link>
        <p>Thoughtful writing, beautifully published.</p>
        <span>© {new Date().getFullYear()} InkSpace</span>
      </footer>
    </>
  )
}
