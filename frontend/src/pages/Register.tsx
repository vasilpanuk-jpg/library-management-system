import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import styles from './Register.module.css'
import { libraryActions } from '../state/libraryStore'

export default function Register() {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const result = await libraryActions.register({ username, fullName, email, phone, password })
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate(`/verify-email?email=${encodeURIComponent(result.email)}`)
  }

  return (
    <PageShell
      title="Реєстрація користувача"
      subtitle="Створіть профіль читача. Адміністратора та бібліотекаря додає системний адміністратор."
    >
      <section className={styles.card}>
        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Username</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="new.reader" />
          </label>
          <label>
            <span>ПІБ</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Іван Іванов" />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@library.local" />
          </label>
          <label>
            <span>Телефон</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+380..." />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="password" />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit">Зареєструватися</button>
        </form>
      </section>
    </PageShell>
  )
}
