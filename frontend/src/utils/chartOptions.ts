import { ChartOptions } from 'chart.js'

export const integerBarChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0,
        callback: (value) => (Number.isInteger(Number(value)) ? value : ''),
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label ?? ''
          const value = Math.round(Number(context.raw ?? 0))
          return `${label}: ${value}`
        },
      },
    },
  },
}
