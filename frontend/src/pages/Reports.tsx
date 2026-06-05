import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import ChartPanel from '../components/ui/ChartPanel'
import styles from './Reports.module.css'
import api from '../services/api'
import { selectDashboardSnapshot, selectReportMetrics, useLibraryStore } from '../state/libraryStore'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Reports() {
  useLibraryStore()
  const metrics = selectReportMetrics()
  const snapshot = selectDashboardSnapshot()

  const inventoryData = {
    labels: ['Усього', 'У наявності', 'Видані', 'Прострочені'],
    datasets: [
      {
        label: 'Одиниці',
        data: [snapshot.totalBooks, snapshot.availableBooks, snapshot.issuedBooks, snapshot.overdueLoans],
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
        data: snapshot.popularBooks.map((item) => item.count),
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
        data: snapshot.readerActivity.map((item) => item.count),
        backgroundColor: 'rgba(250, 204, 21, 0.82)',
        borderRadius: 10,
      },
    ],
  }

  const download = async (type: 'excel' | 'pdf') => {
    const response = await api.get(`/api/reports/export?type=${type}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `library-report.${type === 'excel' ? 'xlsx' : 'pdf'}`
    anchor.click()
  }

  return (
    <PageShell
      title="Аналітика та звіти"
      subtitle="Найпопулярніші книги, кількість видач, активність читачів, середній час читання, прострочки та експорт у PDF/Excel."
    >
      <section className={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={`${metric.value}${metric.detail ? ` ${metric.detail}` : ''}`}
            tone={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'secondary' : index === 3 ? 'warning' : 'danger'}
          />
        ))}
      </section>

      <section className={styles.chartGrid}>
        <ChartPanel title="Стан фонду" subtitle="Загальна кількість, доступні та видані книги">
          <Bar data={inventoryData} />
        </ChartPanel>

        <ChartPanel title="Найпопулярніші книги" subtitle="Книги з найбільшою кількістю видач">
          <Bar data={popularData} />
        </ChartPanel>

        <ChartPanel title="Активність читачів" subtitle="Кількість взятих книг по читачах">
          <Bar data={activityData} />
        </ChartPanel>
      </section>

      <section className={styles.exportCard}>
        <SectionHeader title="Експорт звітів" subtitle="Формуйте PDF або Excel одним натисканням" />
        <div className={styles.exportActions}>
          <button type="button" onClick={() => download('excel')}>Завантажити Excel</button>
          <button type="button" className={styles.secondary} onClick={() => download('pdf')}>Завантажити PDF</button>
        </div>
      </section>
    </PageShell>
  )
}
