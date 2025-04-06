import React, { useRef, useState, useEffect, useCallback } from "react";
import { Box, Container, Typography } from "@mui/material";
import { Chart } from "chart.js/auto";
import { TemperatureChart } from "./components/Chart/TemperatureChart";
import { TimeControls } from "./components/Controls/TimeControls";
import { TemperatureData } from "./components/Types";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:13579';

function App() {
  const chartRef = useRef<HTMLCanvasElement>(null!);
  // 删除这一行
  // const tempChartRef = useRef<Chart | null>(null);
  const [chartData, setChartData] = useState<TemperatureData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 30 * 1000),
    end: new Date()
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = Math.floor(timeRange.start.getTime() / 1000);
      const end = Math.floor(timeRange.end.getTime() / 1000);

      const response = await fetch(
        `${API_BASE_URL}/getTemperatures?start=${start}&end=${end}`,
        {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TemperatureData[] = await response.json();
      setChartData(data);
      // 删除这一行
      // updateChart(data);
    } catch (error) {
      console.error("获取数据失败:", error);
      alert(`获取数据失败: ${error instanceof Error ? error.message : '未知错误'}\n请检查后端服务是否运行`);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  const selectTimeRange = useCallback((seconds: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - seconds * 1000);
    setTimeRange({ start, end });
  }, []);

  useEffect(() => {
    fetchData();
  }, [timeRange, fetchData]);

  useEffect(() => {
    selectTimeRange(30);
  }, [selectTimeRange]);

  // 删除整个 updateChart 函数
  // const updateChart = useCallback((data: TemperatureData[]) => { ... });

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          SSD温度监控
        </Typography>

        <TimeControls
          onSelectTimeRange={selectTimeRange}
          onFetchData={fetchData}
          isLoading={isLoading}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />

        <Box height={400}>
          <TemperatureChart 
            chartRef={chartRef} 
            data={chartData} 
            isLoading={isLoading} 
          />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
