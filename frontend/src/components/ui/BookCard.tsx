import React from 'react'
import styles from './BookCard.module.css'
import { Book } from '../../types/library'

type Props = {
  book: Book
  actions?: React.ReactNode
}

export default function BookCard({ book, actions }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.topRow}>
        <div>
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </div>
        <span className={styles.badge}>{book.availableCopies}/{book.totalCopies}</span>
      </div>

      <div className={styles.meta}>
        <span>{book.category}</span>
        <span>{book.isbn}</span>
        <span>{book.location}</span>
      </div>

      <div className={styles.statusLine}>
        <strong>{book.status === 'available' ? 'У наявності' : book.status === 'issued' ? 'Видана' : 'Проблемна'}</strong>
        <small>Кількість видач: {book.issuedCount}</small>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </article>
  )
}
