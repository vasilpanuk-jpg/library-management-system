import React, { useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import styles from './Users.module.css'
import { libraryActions, useLibraryStore } from '../state/libraryStore'
import { UserRole } from '../types/library'

export default function Users() {
  const { currentUser, users } = useLibraryStore()
  const [query, setQuery] = useState('')

  const filteredUsers = useMemo(() => {
    return users.filter((user) => [user.username, user.fullName, user.email, user.phone, user.role].join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [query, users])

  return (
    <PageShell
      title="Управління користувачами"
      subtitle="Ролі адміністратора, бібліотекаря та читача, а також редагування профілів і доступів."
    >
      <section className={styles.panel}>
        <SectionHeader title="Пошук користувача" subtitle="Знайдіть профіль за ім'ям, email, телефоном чи роллю" />
        <input className={styles.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пошук користувача" />
      </section>

      {filteredUsers.length ? (
        <section className={styles.tableCard}>
          <SectionHeader title="Список користувачів" subtitle="Керування ролями доступне адміну; профіль бачить кожен користувач" />
          <DataTable columns={[{ label: 'Ім’я' }, { label: 'Username' }, { label: 'Email' }, { label: 'Телефон' }, { label: 'Роль' }, { label: 'Дія' }]}>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={styles.roleBadge}>{user.role.replace('ROLE_', '')}</span>
                </td>
                <td>
                  {currentUser?.role === 'ROLE_ADMIN' && user.id !== currentUser.id ? (
                    <select value={user.role} onChange={(event) => void libraryActions.changeRole(user.id, event.target.value as UserRole)}>
                      <option value="ROLE_ADMIN">Адміністратор</option>
                      <option value="ROLE_LIBRARIAN">Бібліотекар</option>
                      <option value="ROLE_READER">Читач</option>
                    </select>
                  ) : (
                    <span className={styles.readOnly}>Лише перегляд</span>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      ) : (
        <EmptyState title="Користувачів не знайдено" description="Спробуйте інший запит або перевірте фільтр пошуку." />
      )}
    </PageShell>
  )
}
