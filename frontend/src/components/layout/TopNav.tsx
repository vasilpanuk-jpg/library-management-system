import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import styles from './TopNav.module.css'
import { THEME } from '../../theme'
import { libraryActions, useLibraryStore } from '../../state/libraryStore'

const adminLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/books', label: 'Книги' },
  { to: '/loans', label: 'Видачі' },
  { to: '/overdue', label: 'Прострочки' },
  { to: '/reports', label: 'Звіти' },
  { to: '/users', label: 'Користувачі' },
  { to: '/profile', label: 'Профіль' },
]

const librarianLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/books', label: 'Книги' },
  { to: '/loans', label: 'Видачі' },
  { to: '/overdue', label: 'Прострочки' },
  { to: '/reports', label: 'Звіти' },
  { to: '/profile', label: 'Профіль' },
]

const readerLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/my-loans', label: 'Мої книги' },
  { to: '/reports', label: 'Звіти' },
  { to: '/profile', label: 'Профіль' },
]

export default function TopNav() {
  const navigate = useNavigate()
  const currentUser = useLibraryStore().currentUser

  const links = currentUser?.role === 'ROLE_READER' ? readerLinks : 
                currentUser?.role === 'ROLE_LIBRARIAN' ? librarianLinks : adminLinks

  const logout = async () => {
    await libraryActions.logout()
    navigate('/login')
  }

  return (
    <header className={styles.nav}>
      <div className={styles.brandWrap}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark}>TL</span>
          <span>
            <strong>{THEME.appName}</strong>
            <small>{THEME.appSubtitle}</small>
          </span>
        </Link>
      </div>

      <nav className={styles.links}>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.userArea}>
        {currentUser ? (
          <>
            <div className={styles.userBadge}>
              <span>{currentUser.fullName}</span>
              <small>{currentUser.role.replace('ROLE_', '')}</small>
            </div>
            <button className={styles.logout} onClick={logout} type="button">
              Вийти
            </button>
          </>
        ) : (
          <div className={styles.authLinks}>
            <NavLink to="/login" className={styles.authLink}>Вхід</NavLink>
            <NavLink to="/register" className={styles.authLink}>Реєстрація</NavLink>
          </div>
        )}
      </div>
    </header>
  )
}
