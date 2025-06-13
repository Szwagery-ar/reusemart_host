import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const pieColors = [
    '#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6',
    '#E11D48', '#0EA5E9', '#A855F7', '#14B8A6', '#F97316'
];

export default function PieChartJt({ data }) {
    const chartData = {
        labels: data.map((d) => d.name),
        datasets: [
            {
                data: data.map((d) => d.value),
                backgroundColor: data.map((_, i) => pieColors[i % pieColors.length]),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.raw.toLocaleString('id-ID')} item`,
                },
            },
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
        },
    };

    return (
        <div className="w-full h-[300px]">
            <Pie data={chartData} options={options} />
        </div>
    );
}
