import React from 'react'
import styles from './StatCard.module.css'

type Props = {
  label: string
  value: string | number
  detail?: string
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export default function StatCard({ label, value, detail, tone = 'primary' }: Props) {
  return (
    <article className={`${styles.card} ${styles[tone]}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </article>
  )
}
