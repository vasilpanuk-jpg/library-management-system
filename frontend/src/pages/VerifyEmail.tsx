import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import styles from './VerifyEmail.module.css'
import { libraryActions } from '../state/libraryStore'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    const result = await libraryActions.verifyEmail(email, code.trim())
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate('/')
  }

  const resend = async () => {
    setError(null)
    setInfo(null)
    const result = await libraryActions.resendVerificationCode(email)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setInfo(result.message)
  }

  return (
    <PageShell
      title="Підтвердження email"
      subtitle="Введіть 8-значний код, який надійшов на вашу пошту."
    >
      <section className={styles.card}>
        <form className={styles.form} onSubmit={submit}>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@library.local" />
          </label>
          <label>
            <span>Код підтвердження (8 цифр)</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="12345678"
              inputMode="numeric"
              pattern="\d{8}"
              maxLength={8}
            />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          {info && <div className={styles.info}>{info}</div>}
          <button type="submit">Підтвердити email</button>
        </form>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => void resend()}>
            Надіслати код повторно
          </button>
          <Link to="/login">Повернутися до входу</Link>
        </div>
      </section>
    </PageShell>
  )
}
