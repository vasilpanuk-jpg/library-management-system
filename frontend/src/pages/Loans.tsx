import React, { useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import styles from './Loans.module.css'
import { libraryActions, useLibraryStore } from '../state/libraryStore'

export default function Loans() {
  const { books, loans, users, currentUser } = useLibraryStore()
  const readers = users.filter((user) => user.role === 'ROLE_READER')
  const [bookId, setBookId] = useState(books[0]?.id ?? 0)
  const [readerId, setReaderId] = useState(readers[0]?.id ?? 0)
  const [periodDays, setPeriodDays] = useState(14)
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all')

  const visibleLoans = useMemo(() => {
    const currentId = currentUser?.id
    return loans.filter((loan) => {
      const roleFilter = currentUser?.role === 'ROLE_READER' ? loan.readerId === currentId : true
      const statusFilter = filter === 'all' ? true : loan.status === filter
      return roleFilter && statusFilter
    })
  }, [currentUser?.id, currentUser?.role, filter, loans])

  const issueLoan = async () => {
    await libraryActions.issueLoan({ bookId, readerId, periodDays })
  }

  const returnLoan = async (loanId: number) => {
    await libraryActions.returnLoan(loanId)
  }

  return (
    <PageShell
      title="Видача та повернення книг"
      subtitle="Оформляйте нові видачі, контролюйте термін повернення, переглядайте історію та закривайте активні записи."
    >
      {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_LIBRARIAN') && (
        <section className={styles.formCard}>
          <SectionHeader title="Нова видача" subtitle="Видайте книгу читачу та автоматично зафіксуйте строк повернення" />
          <div className={styles.formGrid}>
            <label>
              <span>Книга</span>
              <select value={bookId} onChange={(event) => setBookId(Number(event.target.value))}>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} ({book.availableCopies}/{book.totalCopies})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Читач</span>
              <select value={readerId} onChange={(event) => setReaderId(Number(event.target.value))}>
                {readers.map((reader) => (
                  <option key={reader.id} value={reader.id}>
                    {reader.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Термін (днів)</span>
              <input type="number" min="1" value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))} />
            </label>

            <button type="button" onClick={issueLoan}>
              Оформити видачу
            </button>
          </div>
        </section>
      )}

      <section className={styles.filtersRow}>
        {(['all', 'active', 'returned', 'overdue'] as const).map((item) => (
          <button key={item} className={filter === item ? styles.activeFilter : styles.filter} onClick={() => setFilter(item)} type="button">
            {item === 'all' ? 'Усі' : item === 'active' ? 'Активні' : item === 'returned' ? 'Повернуті' : 'Прострочені'}
          </button>
        ))}
      </section>

      <section className={styles.tableCard}>
        <SectionHeader title="Історія видач" subtitle="Повний журнал усіх операцій" />
        {visibleLoans.length ? (
          <DataTable
            columns={[
              { label: 'Книга' },
              { label: 'Читач' },
              { label: 'Видано' },
              { label: 'Повернути до' },
              { label: 'Статус' },
              { label: 'Дії' },
            ]}
          >
            {visibleLoans.map((loan) => {
              const book = books.find((item) => item.id === loan.bookId)
              return (
                <tr key={loan.id}>
                  <td>{book?.title}</td>
                  <td>{loan.readerName}</td>
                  <td>{loan.issueDate}</td>
                  <td>{loan.dueDate}</td>
                  <td>
                    <span className={`${styles.status} ${styles[loan.status]}`}>{loan.status}</span>
                  </td>
                  <td>
                    {loan.status !== 'returned' ? (
                      <button type="button" onClick={() => returnLoan(loan.id)}>
                        Повернути
                      </button>
                    ) : (
                      <span className={styles.done}>Закрито</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </DataTable>
        ) : (
          <EmptyState title="Поки немає видач" description="Створіть першу видачу або змініть фільтр історії." />
        )}
      </section>
    </PageShell>
  )
}
