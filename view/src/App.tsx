import React, { useRef, useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, MenuItem, Select, FormControl } from "@mui/material";
import { TemperatureChart } from "./components/Chart/TemperatureChart";
import { TimeControls } from "./components/Controls/TimeControls";
import { TemperatureData } from "./components/Types";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:13579';

function App() {
  const chartRef = useRef<HTMLDivElement>(null!);
  const [chartData, setChartData] = useState<TemperatureData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [timeRange, setTimeRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date()
  });

  // 新增获取设备列表函数
  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/listPhysicalDisks`,
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

      const data: string[] = await response.json();
      setDevices(data);
      if (data.length > 0) {
        setSelectedDevice(data[0]); // 默认选择第一个设备
      }
    } catch (error) {
      console.error("获取设备列表失败:", error);
    }
  }, []);

  // 修改fetchData函数，添加设备参数
  const fetchData = useCallback(async () => {
    if (!selectedDevice) return;
    
    setIsLoading(true);
    try {
      const start = Math.floor(timeRange.start.getTime() / 1000);
      const end = Math.floor(timeRange.end.getTime() / 1000);

      const response = await fetch(
        `${API_BASE_URL}/getTemperatures?start=${start}&end=${end}&device=${selectedDevice}`,
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
  }, [timeRange, selectedDevice]);

  // 在useEffect中添加获取设备列表
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

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
        <Box display="flex" alignItems="center" mb={3}>
          <Box 
            component="img" 
            src="/ssd-temperature-logo.png" 
            alt="SSD Temperature Logo"
            sx={{ 
              height: '2.125rem',
              marginRight: 2,
              borderRadius: '4px',  // 添加圆角
              display: 'flex',
              alignItems: 'center'  // 确保图片垂直居中
            }}
          />
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              display: 'flex',
              alignItems: 'center',  // 确保文字垂直居中
              marginBottom: 0  // 覆盖 gutterBottom 的默认下边距
            }}
          >
            SSD温度监控
          </Typography>
        </Box>

        <Box mb={3}>
          <FormControl fullWidth>
            <Select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              displayEmpty
              disabled={isLoading || devices.length === 0}
            >
              {devices.map((device) => (
                <MenuItem key={device} value={device}>
                  {device}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

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
