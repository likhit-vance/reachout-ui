import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  '#4f46e5', '#059669', '#d97706', '#dc2626', '#2563eb',
  '#7c3aed', '#0d9488', '#ca8a04', '#ea580c', '#db2777',
];

/**
 * Renders a Chart.js chart from the NL query API visualization payload.
 * Supports bar, pie, line, doughnut. API contract is Chart.js-compatible
 * (labels + datasets).
 */
export function NLQueryChart({ visualization }) {
  if (!visualization?.chart_type || !visualization?.labels || !visualization?.datasets?.length) {
    return null;
  }

  const { chart_type, title, labels, datasets, x_label, y_label } = visualization;

  const isCircular = chart_type === 'pie' || chart_type === 'doughnut';
  const chartData = {
    labels: labels,
    datasets: datasets.map((ds, i) => ({
      label: ds.label ?? `Series ${i + 1}`,
      data: ds.data ?? [],
      backgroundColor:
        isCircular
          ? labels.map((_, j) => CHART_COLORS[j % CHART_COLORS.length])
          : CHART_COLORS[i % CHART_COLORS.length],
      borderColor: chart_type === 'line' ? CHART_COLORS[i % CHART_COLORS.length] : undefined,
      borderWidth: chart_type === 'line' ? 2 : 1,
      fill: chart_type === 'line' && datasets.length === 1,
      tension: 0.2,
    })),
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: { position: 'top' },
      title: { display: !!title, text: title ?? '' },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  const scaleOptions = {
    scales: {
      x: {
        title: { display: !!x_label, text: x_label ?? '' },
      },
      y: {
        beginAtZero: true,
        title: { display: !!y_label, text: y_label ?? '' },
      },
    },
  };

  switch (chart_type) {
    case 'bar':
      return (
        <div className="nl-chart-wrap">
          <Bar data={chartData} options={{ ...commonOptions, ...scaleOptions }} />
        </div>
      );
    case 'line':
      return (
        <div className="nl-chart-wrap">
          <Line data={chartData} options={{ ...commonOptions, ...scaleOptions }} />
        </div>
      );
    case 'pie':
      return (
        <div className="nl-chart-wrap nl-chart-wrap--pie">
          <Pie data={chartData} options={commonOptions} />
        </div>
      );
    case 'doughnut':
      return (
        <div className="nl-chart-wrap nl-chart-wrap--pie">
          <Doughnut data={chartData} options={commonOptions} />
        </div>
      );
    default:
      return null;
  }
}
