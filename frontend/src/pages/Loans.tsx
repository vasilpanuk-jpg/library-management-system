import React, { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import ChartPanel from '../components/ui/ChartPanel'
import DataTable from '../components/ui/DataTable'
import styles from './Loans.module.css'
import { libraryActions, useLibraryStore } from '../state/libraryStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Loans() {
  const { books, loans, users, currentUser } = useLibraryStore()
  const readers = users.filter((user) => user.role === 'ROLE_READER')
  const [bookId, setBookId] = useState(books[0]?.id ?? 0)
  const [readerId, setReaderId] = useState(readers[0]?.id ?? 0)
  const [periodDays, setPeriodDays] = useState(14)
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all')

  const visibleLoans = useMemo(() => {
    const currentId = currentUser?.id
    return loans
      .filter((loan) => {
        const roleFilter = currentUser?.role === 'ROLE_READER' ? loan.readerId === currentId : true
        const statusFilter = filter === 'all' ? true : loan.status === filter
        return roleFilter && statusFilter
      })
      .sort((left, right) => right.issueDate.localeCompare(left.issueDate))
  }, [currentUser?.id, currentUser?.role, filter, loans])

  const issueLoan = async () => {
    if (currentUser?.role !== 'ROLE_ADMIN' && currentUser?.role !== 'ROLE_LIBRARIAN') {
      return
    }
    await libraryActions.issueLoan({ bookId, readerId, periodDays })
  }

  const returnLoan = async (loanId: number) => {
    if (currentUser?.role !== 'ROLE_ADMIN' && currentUser?.role !== 'ROLE_LIBRARIAN') {
      return
    }
    await libraryActions.returnLoan(loanId)
  }

  const isStaff = currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_LIBRARIAN'

  return (
    <PageShell
      title="Видача та повернення книг"
      subtitle="Оформляйте нові видачі, контролюйте термін повернення, переглядайте історію та закривайте активні записи."
    >
      {isStaff && (
        <section className={styles.formCard}>
          <h2 style={{ marginTop: 0 }}>Нова видача</h2>
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

      <section className={styles.filtersRow} style={{ marginTop: 18 }}>
        {(['all', 'active', 'returned', 'overdue'] as const).map((item) => (
          <button
            key={item}
            className={filter === item ? styles.activeFilter : styles.filter}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item === 'all' ? 'Усі' : item === 'active' ? 'Активні' : item === 'returned' ? 'Повернуті' : 'Прострочені'}
          </button>
        ))}
      </section>

      <section className={styles.tableCard} style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Журнал видач</h2>
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
                    {isStaff && loan.status !== 'returned' ? (
                      <button type="button" className={styles.danger} onClick={() => returnLoan(loan.id)}>
                        Повернути
                      </button>
                    ) : (
                      <span className={styles.done}>{loan.status === 'returned' ? 'Закрито' : 'Активна'}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </DataTable>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Немає видач за вибраним фільтром.</p>
        )}
      </section>
    </PageShell>
  )
}
