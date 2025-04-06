export function formatLocalDateTime(date) {
    console.log('原始日期对象:', date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    console.log('格式化后的日期字符串:', formatted);
    return formatted;
}