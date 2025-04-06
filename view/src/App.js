import React, { useEffect, useRef } from 'react';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { Chart } from 'chart.js/auto';

function App() {
  const chartRef = useRef(null);
  let tempChart = null;

  useEffect(() => {
    // 默认加载最近30秒数据
    selectTimeRange(30);
  }, []);

  const quickSelectButtons = [
    { label: '最近30秒', seconds: 30 },
    { label: '最近5分钟', seconds: 300 },
    { label: '最近10分钟', seconds: 600 },
    { label: '最近30分钟', seconds: 1800 },
    { label: '最近1小时', seconds: 3600 },
    { label: '最近3小时', seconds: 10800 },
    { label: '最近6小时', seconds: 21600 },
    { label: '最近12小时', seconds: 43200 },
  ];

  function formatLocalDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  function selectTimeRange(seconds) {
    const end = new Date();
    const start = new Date(end - seconds * 1000);

    document.getElementById("start").value = formatLocalDateTime(start);
    document.getElementById("end").value = formatLocalDateTime(end);

    setTimeout(() => {
      fetchData();
    }, 0);
  }

  function updateChart(data) {
    const ctx = chartRef.current.getContext('2d');
    const labels = data.map((item) =>
      new Date(item.created_at * 1000).toLocaleString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    const temps = data.map((item) => item.value);

    if (tempChart) {
      tempChart.destroy();
    }

    tempChart = new Chart(ctx, {
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
  }

  function fetchData() {
    const startInput = document.getElementById("start");
    const endInput = document.getElementById("end");

    if (!startInput.value || !endInput.value) {
        alert("请选择开始和结束时间");
        return;
    }

    const start = Math.floor(new Date(startInput.value).getTime() / 1000);
    const end = Math.floor(new Date(endInput.value).getTime() / 1000);
    
    fetch(`http://localhost:13579/getTemperatures?start=${start}&end=${end}`, {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
      .then((response) => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
      })
      .then((data) => updateChart(data))
      .catch((error) => {
          console.error("获取数据失败:", error);
          alert(`获取数据失败: ${error.message}\n请检查后端服务是否运行`);
      });
}

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          SSD温度监控
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            id="start"
            label="开始时间"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            sx={{ mr: 2 }}
          />
          <TextField
            id="end"
            label="结束时间"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={fetchData}>
            查询
          </Button>
        </Box>

        <Box mb={3}>
          {quickSelectButtons.map((btn) => (
            <Button
              key={btn.seconds}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => selectTimeRange(btn.seconds)}
            >
              {btn.label}
            </Button>
          ))}
        </Box>

        <Box height={400}>
          <canvas ref={chartRef} id="tempChart"></canvas>
        </Box>
      </Box>
    </Container>
  );
}

export default App;