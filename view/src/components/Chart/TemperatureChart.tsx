import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { TemperatureData } from '../Types';

interface TemperatureChartProps {
  chartRef: React.RefObject<HTMLDivElement>;  // 改为 div
  data: TemperatureData[];
  isLoading: boolean;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ chartRef, data, isLoading }) => {
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化 ECharts 实例
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const labels = data.map((item) =>
      new Date(item.created_at * 1000).toLocaleString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    
    const temps = data.map((item) => item.value);

    // 配置 ECharts 选项
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: labels,
      },
      yAxis: {
        type: 'value',
        name: '温度 (°C)',
      },
      series: [{
        name: 'SSD温度',
        type: 'line',
        data: temps,
        smooth: true,  // 启用平滑曲线
        lineStyle: {
          color: 'rgb(75, 192, 192)',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(75, 192, 192, 0.3)' },
            { offset: 1, color: 'rgba(75, 192, 192, 0.1)' }
          ])
        }
      }]
    };

    // 设置配置项
    chartInstance.current.setOption(option);

    // 监听窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [data, chartRef]);  // Added chartRef to dependency array

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};