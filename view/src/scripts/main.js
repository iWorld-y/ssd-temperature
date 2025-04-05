import { updateChart } from './chart.js';
import { formatLocalDateTime } from './timeUtils.js';

export function fetchData() {
    const startInput = document.getElementById('start');
    const endInput = document.getElementById('end');
    
    if (!startInput.value || !endInput.value) {
        alert('请选择开始和结束时间');
        return;
    }
    
    const start = Math.floor(new Date(startInput.value).getTime() / 1000);
    const end = Math.floor(new Date(endInput.value).getTime() / 1000);
    
    fetch(`/getTemperatures?start=${start}&end=${end}`)
        .then(response => response.json())
        .then(data => {
            updateChart(data);
        })
        .catch(error => {
            console.error('请求失败:', error);
            alert('获取数据失败');
        });
}

export function selectTimeRange(seconds) {
    const end = new Date();
    const start = new Date(end - seconds * 1000);
    document.getElementById('start').value = formatLocalDateTime(start);
    document.getElementById('end').value = formatLocalDateTime(end);
    
    fetchData();
}