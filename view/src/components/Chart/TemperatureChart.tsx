import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { TemperatureData } from '../Types';

interface TemperatureChartProps {
  chartRef: React.RefObject<HTMLCanvasElement>;
  data: TemperatureData[];
  isLoading: boolean;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ chartRef, data, isLoading }) => {
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // 确保在创建新图表前销毁旧图表
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map((item) =>
      new Date(item.created_at * 1000).toLocaleString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    
    const temps = data.map((item) => item.value);

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "SSD温度 (°C)",
            data: temps,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return <canvas ref={chartRef} id="tempChart" />;
}