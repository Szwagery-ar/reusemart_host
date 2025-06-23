import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatToJt = (value) => {
  if (!value || value === 0) return 'Rp 0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (numValue >= 1_000_000) {
    return `Rp ${(numValue / 1_000_000).toFixed(1)} jt`;
  } else if (numValue >= 1_000) {
    return `Rp ${(numValue / 1_000).toFixed(0)} rb`;
  } else {
    return `Rp ${numValue.toLocaleString('id-ID')}`;
  }
};

export default function BarChartJt({ data }) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Penjualan (Rp)',
        data: data.map((d) => {
          // Pastikan value adalah number
          const value = typeof d.value === 'string' ? parseFloat(d.value) : d.value;
          return value || 0;
        }),
        backgroundColor: 'rgba(34, 17, 241, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => formatToJt(context.raw),
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatToJt(value),
          maxTicksLimit: 8, // Batasi jumlah tick untuk menghindari tampilan yang berantakan
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}