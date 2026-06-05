import React, { useState } from 'react'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import DataTable from '../components/ui/DataTable'
import styles from './AdminBooks.module.css'
import { libraryActions, useLibraryStore } from '../state/libraryStore'

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  keywords: '',
  year: new Date().getFullYear(),
  publisher: '',
  location: '',
  totalCopies: 1,
}

export default function AdminBooks() {
  const { books } = useLibraryStore()
  const [form, setForm] = useState(emptyForm)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)

  const save = async () => {
    const payload = {
      ...form,
      keywords: form.keywords.split(',').map((item) => item.trim()).filter(Boolean),
    }

    if (selectedBookId) {
      await libraryActions.updateBook(selectedBookId, {
        title: payload.title,
        author: payload.author,
        isbn: payload.isbn,
        category: payload.category,
        keywords: payload.keywords,
        year: payload.year,
        publisher: payload.publisher,
        location: payload.location,
        totalCopies: payload.totalCopies,
        availableCopies: payload.totalCopies,
      })
    } else {
      await libraryActions.addBook({
        ...payload,
        availableCopies: payload.totalCopies,
      })
    }

    setSelectedBookId(null)
    setForm(emptyForm)
  }

  const edit = (bookId: number) => {
    const book = books.find((item) => item.id === bookId)
    if (!book) return
    setSelectedBookId(book.id)
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      keywords: book.keywords.join(', '),
      year: book.year,
      publisher: book.publisher,
      location: book.location,
      totalCopies: book.totalCopies,
    })
  }

  const remove = async (bookId: number) => {
    await libraryActions.deleteBook(bookId)
    if (selectedBookId === bookId) {
      setSelectedBookId(null)
      setForm(emptyForm)
    }
  }

  return (
    <PageShell
      title="Керування фондом"
      subtitle="Додавайте нові книги, редагуйте метадані, списуйте старі видання та контролюйте кількість екземплярів."
    >
      <section className={styles.card}>
        <SectionHeader title={selectedBookId ? 'Редагування книги' : 'Нова книга'} subtitle="Повний набір даних для каталогу технічної літератури" />
        <div className={styles.formGrid}>
          {[
            ['title', 'Назва'],
            ['author', 'Автор'],
            ['isbn', 'ISBN'],
            ['category', 'Категорія'],
            ['keywords', 'Ключові слова (через кому)'],
            ['publisher', 'Видавництво'],
            ['location', 'Місцезнаходження'],
          ].map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input
                value={(form as any)[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
          <label>
            <span>Рік видання</span>
            <input type="number" value={form.year} onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Кількість екземплярів</span>
            <input type="number" min="1" value={form.totalCopies} onChange={(event) => setForm((current) => ({ ...current, totalCopies: Number(event.target.value) }))} />
          </label>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={save}>
            {selectedBookId ? 'Зберегти зміни' : 'Додати книгу'}
          </button>
          {selectedBookId && (
            <button type="button" className={styles.secondary} onClick={() => { setSelectedBookId(null); setForm(emptyForm) }}>
              Скасувати редагування
            </button>
          )}
        </div>
      </section>

      <section className={styles.card}>
        <SectionHeader title="Каталог фонду" subtitle="Редагуйте, поповнюйте та списуйте книги без переходу в інші екрани" />
        <DataTable columns={[{ label: 'Назва' }, { label: 'Автор' }, { label: 'ISBN' }, { label: 'Категорія' }, { label: 'Екз.' }, { label: 'Дії' }]}>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn}</td>
              <td>{book.category}</td>
              <td>
                {book.availableCopies}/{book.totalCopies}
              </td>
              <td className={styles.rowActions}>
                <button type="button" onClick={() => edit(book.id)}>Редагувати</button>
                <button type="button" className={styles.danger} onClick={() => remove(book.id)}>Списати</button>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </PageShell>
  )
}
