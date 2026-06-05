import React from 'react'
import styles from './ChartPanel.module.css'

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function ChartPanel({ title, subtitle, children }: Props) {
  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
