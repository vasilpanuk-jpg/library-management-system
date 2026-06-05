import React from 'react'
import styles from './DataTable.module.css'

type Column = {
  label: string
  width?: string
}

type Props = {
  columns: Column[]
  children: React.ReactNode
}

export default function DataTable({ columns, children }: Props) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label} style={column.width ? { width: column.width } : undefined}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
