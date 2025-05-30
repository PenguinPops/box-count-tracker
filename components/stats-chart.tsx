'use client'

import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { t, Lang } from '@/lib/i18n'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

type StatsChartProps = {
  stats: any[]
  labelKey: string
  lang: Lang
}

const StatsChart: React.FC<StatsChartProps> = ({ stats, labelKey, lang }) => {
  const [filter, setFilter] = useState<'both' | 'e1' | 'e2'>('both')

  const reversedStats = [...stats].reverse();

  const labels = reversedStats.map((item) => item[labelKey])

  // Helper to conditionally include datasets by filter
  const getDatasets = () => {
    const datasets = []

    if (filter === 'both' || filter === 'e2') {
      datasets.push(
        {
          type: 'bar' as const,
          label: t(lang, 'e2Intake'),
          data: reversedStats.map((item) => item.total_e2in),
          backgroundColor: 'rgba(153,100,255,0.5)',
          yAxisID: 'y',
        },
        {
          type: 'bar' as const,
          label: t(lang, 'e2Output'),
          data: reversedStats.map((item) => item.total_e2out),
          backgroundColor: 'rgba(153,150,255,0.5)',
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: t(lang, 'balanceE2'),
          data: reversedStats.map((item) => item.total_e2out - item.total_e2in),
          borderColor: 'rgba(153,255,255,1)',
          backgroundColor: 'rgba(153,255,255,0.8)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        }
      )
    }

    if (filter === 'both' || filter === 'e1') {
      datasets.push(
        {
          type: 'bar' as const,
          label: t(lang, 'e1Intake'),
          data: reversedStats.map((item) => item.total_e1in),
          backgroundColor: 'rgba(255,100,153,0.5)',
          yAxisID: 'y',
        },
        {
          type: 'bar' as const,
          label: t(lang, 'e1Output'),
          data: reversedStats.map((item) => item.total_e1out),
          backgroundColor: 'rgba(255,150,153,0.5)',
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: t(lang, 'balanceE1'),
          data: reversedStats.map((item) => item.total_e1out - item.total_e1in),
          borderColor: 'rgba(255,200,153,1)',
          backgroundColor: 'rgba(255,255,153,0.8)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        }
      )
    }

    return datasets
  }

  const chartData = {
    labels,
    datasets: getDatasets(),
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: t(lang, 'intakeOutput'),
        },
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: t(lang, 'balance'),
        },
        grid: {
          drawOnChartArea: false,
          borderDash: [5, 5],
          color: (ctx: any) => (ctx.tick.value === 0 ? 'rgba(128,128,128,1)' : 'transparent'),
        },
      },
    },
  }

  return (
    <div className="mb-6">
      {/* Dropdown filter */}
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2 font-medium">
          {t(lang, 'show')}:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'both' | 'e1' | 'e2')}
          className="border rounded px-2 py-1"
        >
          <option value="both">{t(lang, 'e1AndE2')}</option>
          <option value="e1">{t(lang, 'e1Only')}</option>
          <option value="e2">{t(lang, 'e2Only')}</option>
        </select>
      </div>

      <Chart type="bar" data={chartData} options={options} />
    </div>
  )
}

export default StatsChart