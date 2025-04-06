import { QuickSelectButton } from '../Types';
import { Box, Button } from '@mui/material';

interface TimeControlsProps {
  onSelectTimeRange: (seconds: number) => void;
  onFetchData: () => void;
  isLoading: boolean;
  timeRange: {
    start: Date;
    end: Date;
  };
  setTimeRange: React.Dispatch<React.SetStateAction<{
    start: Date;
    end: Date;
  }>>;
}

export function TimeControls({ onSelectTimeRange, onFetchData }: TimeControlsProps) {
  const quickSelectButtons: QuickSelectButton[] = [
    { label: '最近30秒', seconds: 30 },
    { label: '最近5分钟', seconds: 300 },
    { label: '最近10分钟', seconds: 600 },
    { label: '最近30分钟', seconds: 1800 },
    { label: '最近1小时', seconds: 3600 },
    { label: '最近3小时', seconds: 10800 },
    { label: '最近6小时', seconds: 21600 },
    { label: '最近12小时', seconds: 43200 },
  ];

  function formatLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  return (
    <>
      <Box display="flex" alignItems="center" mb={2}>
        {/* 时间输入框和查询按钮 */}
      </Box>
      <Box mb={3}>
        {quickSelectButtons.map((btn) => (
          <Button
            key={btn.seconds}
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
            onClick={() => onSelectTimeRange(btn.seconds)}
          >
            {btn.label}
          </Button>
        ))}
      </Box>
    </>
  );
}