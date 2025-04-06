let tempChart;

export function updateChart(data) {
  const ctx = document.getElementById("tempChart").getContext("2d");
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
