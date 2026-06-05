import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import styles from './Login.module.css'
import { libraryActions } from '../state/libraryStore'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const verifyEmail = searchParams.get('verifyEmail')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await libraryActions.login({ username, password })
    if (!result.ok) {
      setError(result.message)
      if (result.message.includes('email')) {
        navigate('/verify-email')
      }
      return
    }
    if (!result.user.emailVerified) {
      navigate(`/verify-email?email=${encodeURIComponent(result.user.email)}`)
      return
    }
    navigate('/')
  }

  return (
    <PageShell
      title="Вхід у систему"
      subtitle="Авторизуйтеся як адміністратор, бібліотекар або читач. Для демо доступні приклади облікових записів у формі нижче."
    >
      <section className={styles.card}>
        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" />
          </label>

          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="admin" />
          </label>

          {verifyEmail && <div className={styles.info}>Підтвердіть email перед входом у систему.</div>}
          {error && <div className={styles.error}>{error}</div>}

          <button type="submit">Увійти</button>
        </form>

        <div className={styles.demoBox}>
          <strong>Демо-облікові записи</strong>
          <p>admin / admin</p>
          <p>librarian / librarian</p>
          <p>reader / reader</p>
          <Link to="/register">Потрібен новий акаунт? Зареєструватися</Link>
        </div>
      </section>
    </PageShell>
  )
}
