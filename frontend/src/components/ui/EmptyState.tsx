import React from 'react'
import styles from './EmptyState.module.css'

type Props = {
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className={styles.wrap}>
      <strong>{title}</strong>
      <p>{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
