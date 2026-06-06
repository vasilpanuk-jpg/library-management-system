import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import styles from './Profile.module.css'
import { libraryActions, useLibraryStore } from '../state/libraryStore'

export default function Profile() {
  const { currentUser } = useLibraryStore()
  const [fullName, setFullName] = useState(currentUser?.fullName ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const save = async () => {
    setMessage(null)
    try {
      await libraryActions.updateProfile({ fullName, email, phone, password: password || undefined })
      setPassword('')
      setMessage({ type: 'success', text: password ? 'Профіль та пароль оновлено' : 'Профіль оновлено' })
    } catch {
      setMessage({ type: 'error', text: 'Не вдалося оновити профіль. Спробуйте ще раз.' })
    }
  }

  return (
    <PageShell
      title="Редагування профілю"
      subtitle="Оновлюйте контактні дані, ПІБ та пароль в одному місці."
    >
      <section className={styles.card}>
        <SectionHeader
          title={currentUser?.fullName ?? 'Профіль'}
          subtitle={`Роль: ${currentUser?.role.replace('ROLE_', '') ?? '—'}${currentUser?.emailVerified ? '' : ' · Email не підтверджено'}`}
        />
        {!currentUser?.emailVerified && (
          <p className={styles.warning}>
            Підтвердіть email, щоб отримати повний доступ.{' '}
            <Link to={`/verify-email?email=${encodeURIComponent(currentUser?.email ?? '')}`}>Ввести код</Link>
          </p>
        )}
        <div className={styles.formGrid}>
          <label>
            <span>ПІБ</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Телефон</span>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label>
            <span>Новий пароль</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <small className={password ? styles.passwordHint : undefined}>
              {password ? 'Пароль буде змінено після збереження' : 'Залиште порожнім, щоб залишити поточний пароль'}
            </small>
          </label>
        </div>
        {message && (
          <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
            {message.text}
          </div>
        )}
        <button className={styles.save} type="button" onClick={save}>
          Зберегти зміни
        </button>
      </section>
    </PageShell>
  )
}
