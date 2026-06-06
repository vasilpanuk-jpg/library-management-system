import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import PageShell from '../components/layout/PageShell'
import SectionHeader from '../components/ui/SectionHeader'
import StatCard from '../components/ui/StatCard'
import ChartPanel from '../components/ui/ChartPanel'
import BookCard from '../components/ui/BookCard'
import styles from './Dashboard.module.css'
import { libraryActions, selectDashboardSnapshot, selectReportMetrics, useLibraryStore } from '../state/libraryStore'
import { integerBarChartOptions } from '../utils/chartOptions'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const { books, currentUser } = useLibraryStore()

  useEffect(() => {
    void libraryActions.refresh()
  }, [])
  const snapshot = selectDashboardSnapshot()
  const metrics = selectReportMetrics()
  const featuredBooks = books.slice().sort((left, right) => right.issuedCount - left.issuedCount).slice(0, 3)

  const popularData = {
    labels: snapshot.popularBooks.map((book) => book.title),
    datasets: [
      {
        label: 'Видачі',
        data: snapshot.popularBooks.map((book) => Math.round(book.count)),
        backgroundColor: 'rgba(37, 99, 235, 0.72)',
        borderRadius: 10,
      },
    ],
  }

  const activityData = {
    labels: snapshot.readerActivity.map((item) => item.name),
    datasets: [
      {
        label: 'Активність читачів',
        data: snapshot.readerActivity.map((item) => Math.round(item.count)),
        backgroundColor: 'rgba(15, 118, 110, 0.72)',
        borderRadius: 10,
      },
    ],
  }

  return (
    <PageShell
      title={`Вітання, ${currentUser?.fullName ?? 'користувачу'}`}
      subtitle="Усі ключові показники бібліотеки технічної літератури в одному місці: фонди, видачі, прострочки, активність читачів і найпопулярніші книги."
      actions={
        <>
          <Link className={styles.actionLink} to="/catalog">
            Перейти до каталогу
          </Link>
          <Link className={styles.actionLinkSecondary} to="/reports">
            Відкрити звіти
          </Link>
        </>
      }
    >
      <section className={styles.statsGrid}>
        {metrics.map((metric, index) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={`${metric.value}${metric.detail ? ` ${metric.detail}` : ''}`}
            tone={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'secondary' : index === 3 ? 'warning' : 'danger'}
          />
        ))}
      </section>

      <section className={styles.quickGrid}>
        <div className={styles.quickCard}>
          <SectionHeader title="Швидкі дії" subtitle="Стартові кроки для щоденної роботи" />
          <div className={styles.quickActions}>
            <Link to="/books">Керування книгами</Link>
            <Link to="/loans">Оформити видачу</Link>
            <Link to="/overdue">Перевірити прострочки</Link>
            <Link to="/users">Керувати користувачами</Link>
          </div>
        </div>

        <div className={styles.quickCard}>
          <SectionHeader title="Поточний стан фонду" subtitle="Що відбувається зараз у бібліотеці" />
          <ul className={styles.stateList}>
            <li><span>Загальний фонд</span><strong>{snapshot.totalBooks}</strong></li>
            <li><span>У наявності</span><strong>{snapshot.availableBooks}</strong></li>
            <li><span>На руках у читачів</span><strong>{snapshot.issuedBooks}</strong></li>
            <li><span>Прострочено</span><strong>{snapshot.overdueLoans}</strong></li>
          </ul>
        </div>
      </section>

      <section className={styles.chartsGrid}>
        <ChartPanel title="Найпопулярніші книги" subtitle="Графік кількості видач по книгах">
          <Bar data={popularData} options={integerBarChartOptions} />
        </ChartPanel>

        <ChartPanel title="Активність читачів" subtitle="Скільки книг бере кожен читач">
          <Bar data={activityData} options={integerBarChartOptions} />
        </ChartPanel>
      </section>

      <section className={styles.featuredSection}>
        <SectionHeader title="Флагманські книги" subtitle="Картки найчастіше використовуваних видань" />
        <div className={styles.bookGrid}>
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
