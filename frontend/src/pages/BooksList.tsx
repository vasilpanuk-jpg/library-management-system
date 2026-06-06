import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import SearchFilters from '../components/ui/SearchFilters'
import BookCard from '../components/ui/BookCard'
import EmptyState from '../components/ui/EmptyState'
import styles from './BooksList.module.css'
import { BookFilters } from '../types/library'
import { libraryActions, selectBooks, useLibraryStore } from '../state/libraryStore'

const defaultFilters: BookFilters = {
  query: '',
  category: 'all',
  status: 'all',
  sortBy: 'title',
}

export default function BooksList() {
  const [filters, setFilters] = useState<BookFilters>(defaultFilters)
  const { books: allBooks, currentUser } = useLibraryStore()
  const categories = useMemo(() => Array.from(new Set(allBooks.map((book) => book.category))).sort(), [allBooks])
  const books = useMemo(() => selectBooks(filters), [filters])
  const navigate = useNavigate()

  const openIssueFlow = async (bookId: number) => {
    if (!currentUser) return
    if (currentUser.role === 'ROLE_READER') {
      await libraryActions.issueLoan({ bookId, readerId: currentUser.id })
      return
    }
    navigate('/loans')
  }

  return (
    <PageShell
      title="Каталог літератури"
      subtitle="Шукайте книги за назвою, автором, ISBN, категорією або ключовими словами. Фільтруйте, сортуйте й одразу бачте кількість доступних екземплярів."
      actions={currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_LIBRARIAN' ? <Link className={styles.secondaryAction} to="/books">Керування фондом</Link> : undefined}
    >
      <section className={styles.statsGrid}>
        <StatCard label="Усього примірників" value={allBooks.reduce((sum, book) => sum + (book.totalCopies || 0), 0)} tone="primary" />
        <StatCard label="У наявності" value={allBooks.reduce((sum, book) => sum + (book.availableCopies || 0), 0)} tone="success" />
        <StatCard label="Видані" value={allBooks.reduce((sum, book) => sum + ((book.totalCopies || 0) - (book.availableCopies || 0)), 0)} tone="warning" />
        <StatCard label="Найменувань" value={allBooks.length} tone="secondary" />
      </section>

      <SearchFilters filters={filters} categories={categories} onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))} onReset={() => setFilters(defaultFilters)} />

      {books.length ? (
        <>
          <SectionHeader title="Картки книг" subtitle="Показано результати пошуку й фільтрації" />
          <div className={styles.grid}>
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                actions={
                  <>
                    {currentUser?.role === 'ROLE_READER' && (
                      <button type="button" onClick={() => openIssueFlow(book.id)} disabled={book.availableCopies === 0}>
                        {book.availableCopies > 0 ? 'Позичити' : 'Немає в наявності'}
                      </button>
                    )}
                    {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_LIBRARIAN') && (
                      <Link to="/loans" className={styles.secondaryButton}>
                        Видати читачу
                      </Link>
                    )}
                    <Link to="/reports" className={styles.ghostButton}>
                      Дивитися звіти
                    </Link>
                  </>
                }
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="Нічого не знайдено" description="Спробуйте інший запит або змініть фільтри каталогу." />
      )}
    </PageShell>
  )
}
