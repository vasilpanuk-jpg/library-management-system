import React from 'react'
import styles from './SearchFilters.module.css'
import { BookFilters } from '../../types/library'

type Props = {
  filters: BookFilters
  categories: string[]
  statuses?: Array<'all' | 'available' | 'issued' | 'maintenance' | 'lost'>
  onChange: (patch: Partial<BookFilters>) => void
  onReset?: () => void
}

export default function SearchFilters({ filters, categories, statuses = ['all', 'available', 'issued', 'maintenance', 'lost'], onChange, onReset }: Props) {
  return (
    <section className={styles.wrap}>
      <input
        className={styles.input}
        type="search"
        placeholder="Пошук за назвою, автором, ISBN, категорією або ключовими словами"
        value={filters.query}
        onChange={(event) => onChange({ query: event.target.value })}
      />

      <select className={styles.select} value={filters.category} onChange={(event) => onChange({ category: event.target.value })}>
        <option value="all">Усі категорії</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select className={styles.select} value={filters.status} onChange={(event) => onChange({ status: event.target.value })}>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status === 'all' ? 'Усі статуси' : status}
          </option>
        ))}
      </select>

      <select className={styles.select} value={filters.sortBy} onChange={(event) => onChange({ sortBy: event.target.value as BookFilters['sortBy'] })}>
        <option value="title">Сортувати за назвою</option>
        <option value="author">Сортувати за автором</option>
        <option value="available">Більше доступних</option>
        <option value="issued">Більше видач</option>
      </select>

      {onReset && (
        <button className={styles.reset} onClick={onReset} type="button">
          Скинути
        </button>
      )}
    </section>
  )
}
