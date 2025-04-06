import { updateChart } from "./chart.js";
import { formatLocalDateTime } from "./timeUtils.js";

export function selectTimeRange(seconds) {
  console.log("selectTimeRange 被调用，参数 seconds:", seconds);
  const end = new Date();
  const start = new Date(end - seconds * 1000);
  console.log("计算得到的时间范围 - start:", start, "end:", end);

  document.getElementById("start").value = formatLocalDateTime(start);
  document.getElementById("end").value = formatLocalDateTime(end);

  console.log(
    "时间输入框的值 - start:",
    document.getElementById("start").value,
    "end:",
    document.getElementById("end").value
  );

  setTimeout(() => {
    console.log("即将调用 fetchData");
    fetchData();
  }, 0);
}

export function fetchData() {
  console.log("fetchData 被调用");
  const startInput = document.getElementById("start");
  const endInput = document.getElementById("end");

  if (!startInput.value || !endInput.value) {
    console.error("时间输入框为空");
    alert("请选择开始和结束时间");
    return;
  }

  const start = Math.floor(new Date(startInput.value).getTime() / 1000);
  const end = Math.floor(new Date(endInput.value).getTime() / 1000);
  console.log("转换后的时间戳 - start:", start, "end:", end);

  console.log(
    "准备发起请求，URL:",
    `/getTemperatures?start=${start}&end=${end}`
  );
  fetch(`/getTemperatures?start=${start}&end=${end}`)
    .then((response) => {
      console.log("收到响应，状态码:", response.status);
      return response.json();
    })
    .then((data) => {
      console.log("收到的数据:", data);
      updateChart(data);
    })
    .catch((error) => {
      console.error("请求失败:", error);
      alert("获取数据失败");
    });
}
