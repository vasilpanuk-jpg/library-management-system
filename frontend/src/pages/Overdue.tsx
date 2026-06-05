import React from 'react'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import styles from './Overdue.module.css'
import { libraryActions, useLibraryStore } from '../state/libraryStore'

export default function Overdue() {
  const { books, loans } = useLibraryStore()
  const overdueLoans = loans.filter((loan) => loan.status === 'overdue')
  const debtors = Array.from(new Set(overdueLoans.map((loan) => loan.readerName)))

  return (
    <PageShell
      title="Контроль прострочень"
      subtitle="Відстежуйте боржників, бачите прострочені книги та закривайте повернення прямо з таблиці."
    >
      <section className={styles.statsGrid}>
        <StatCard label="Прострочені книги" value={overdueLoans.length} tone="danger" />
        <StatCard label="Боржники" value={debtors.length} tone="warning" />
        <StatCard label="Повернень сьогодні" value={loans.filter((loan) => loan.returnedAt === new Date().toISOString().slice(0, 10)).length} tone="success" />
      </section>

      {overdueLoans.length ? (
        <section className={styles.tableCard}>
          <SectionHeader title="Список боржників" subtitle="Прострочені записи з можливістю закриття" />
          <DataTable columns={[{ label: 'Книга' }, { label: 'Читач' }, { label: 'Дата видачі' }, { label: 'Має бути повернено' }, { label: 'Дія' }]}>
            {overdueLoans.map((loan) => {
              const book = books.find((item) => item.id === loan.bookId)
              return (
                <tr key={loan.id}>
                  <td>{book?.title}</td>
                  <td>{loan.readerName}</td>
                  <td>{loan.issueDate}</td>
                  <td>{loan.dueDate}</td>
                  <td>
                    <button type="button" onClick={() => void libraryActions.returnLoan(loan.id)}>
                      Позначити повернення
                    </button>
                  </td>
                </tr>
              )
            })}
          </DataTable>
        </section>
      ) : (
        <EmptyState title="Прострочень немає" description="Система не виявила жодної простроченої видачі. Все під контролем." />
      )}
    </PageShell>
  )
}
