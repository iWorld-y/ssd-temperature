import React, { useRef, useState, useEffect, useCallback } from "react";
import { Box, Container, Typography } from "@mui/material";
import { TemperatureChart } from "./components/Chart/TemperatureChart";
import { TimeControls } from "./components/Controls/TimeControls";
import { TemperatureData } from "./components/Types";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:13579';

function App() {
  const chartRef = useRef<HTMLDivElement>(null!);
  const [chartData, setChartData] = useState<TemperatureData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 修改默认时间范围为24小时
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
    selectTimeRange(24 * 60 * 60); // 修改初始时间范围为24小时
  }, [selectTimeRange]);

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
          maxDays={31} // 添加最大可选天数限制
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
