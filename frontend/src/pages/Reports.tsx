import React, { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import ChartPanel from '../components/ui/ChartPanel'
import styles from './Reports.module.css'
import { libraryApi } from '../services/libraryApi'
import { selectDashboardSnapshot, useLibraryStore } from '../state/libraryStore'
import { integerBarChartOptions } from '../utils/chartOptions'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Reports() {
  const { currentUser } = useLibraryStore()
  const [exportError, setExportError] = useState<string | null>(null)
  const snapshot = selectDashboardSnapshot()

  const inventoryData = {
    labels: ['Усього', 'У наявності', 'Видані', 'Прострочені'],
    datasets: [
      {
        label: 'Одиниці',
        data: [snapshot.totalBooks, snapshot.availableBooks, snapshot.issuedBooks, snapshot.overdueLoans].map(Math.round),
        backgroundColor: ['rgba(37, 99, 235, 0.72)', 'rgba(22, 163, 74, 0.72)', 'rgba(217, 119, 6, 0.72)', 'rgba(220, 38, 38, 0.72)'],
        borderRadius: 10,
      },
    ],
  }

  const popularData = {
    labels: snapshot.popularBooks.map((item) => item.title),
    datasets: [
      {
        label: 'Видачі',
        data: snapshot.popularBooks.map((item) => Math.round(item.count)),
        backgroundColor: 'rgba(15, 118, 110, 0.72)',
        borderRadius: 10,
      },
    ],
  }

  const activityData = {
    labels: snapshot.readerActivity.map((item) => item.name),
    datasets: [
      {
        label: 'Активність',
        data: snapshot.readerActivity.map((item) => Math.round(item.count)),
        backgroundColor: 'rgba(250, 204, 21, 0.82)',
        borderRadius: 10,
      },
    ],
  }

  const download = async (type: 'excel' | 'pdf') => {
    setExportError(null)
    const result = await libraryApi.exportReport(type)
    if (!result.ok) {
      setExportError(result.message)
      return
    }
    const url = window.URL.createObjectURL(result.blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `library-report.${type === 'excel' ? 'xlsx' : 'pdf'}`
    anchor.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <PageShell
      title="Аналітика та звіти"
      subtitle="Найпопулярніші книги, кількість видач, активність читачів, середній час читання, прострочки та експорт у PDF/Excel."
    >
      <section className={styles.metricsGrid}>
        <StatCard label="Загалом примірників" value={`${Math.round(snapshot.totalBooks ?? 0)}`} tone="primary" />
        <StatCard label="Взято на цей тиждень" value={`${Math.round(snapshot.weekIssued ?? 0)}`} tone="secondary" />
        <StatCard label="Повернуто на цей тиждень" value={`${Math.round(snapshot.weekReturned ?? 0)}`} tone="success" />
        <StatCard label="Всього у наявності" value={`${Math.round(snapshot.availableBooks ?? 0)}`} tone="success" />
        <StatCard label="Видано" value={`${Math.round(snapshot.issuedBooks ?? 0)}`} tone="warning" />
        <StatCard label="Прострочено" value={`${Math.round(snapshot.overdueLoans ?? 0)}`} tone="danger" />
      </section>

      <section className={styles.chartGrid}>
        <ChartPanel title="Стан фонду" subtitle="Загальна кількість, доступні, видані, прострочені">
          <Bar data={inventoryData} options={integerBarChartOptions} />
        </ChartPanel>

        <ChartPanel title="Найпопулярніші книги" subtitle="Книги з найбільшою кількістю видач">
          <Bar data={popularData} options={integerBarChartOptions} />
        </ChartPanel>

        <ChartPanel title="Активність читачів" subtitle="Кількість взятих книг по читачах">
          <Bar data={activityData} options={integerBarChartOptions} />
        </ChartPanel>
      </section>

      {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_LIBRARIAN') && (
        <section className={styles.exportCard}>
          <SectionHeader title="Експорт звітів" subtitle="Завантажте звіт у форматі Excel" />
          <div className={styles.exportActions}>
            <button type="button" onClick={() => void download('excel')}>Завантажити Excel</button>
          </div>
          {exportError && <p className={styles.exportError}>{exportError}</p>}
        </section>
      )}
    </PageShell>
  )
}
