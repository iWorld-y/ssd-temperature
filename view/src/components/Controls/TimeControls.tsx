import React from "react";
import { Box, Button, ButtonGroup } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import zhCN from "date-fns/locale/zh-CN"; // 修改导入方式

interface TimeControlsProps {
  onSelectTimeRange: (seconds: number) => void;
  onFetchData: () => void;
  isLoading: boolean;
  timeRange: {
    start: Date;
    end: Date;
  };
  setTimeRange: (range: { start: Date; end: Date }) => void;
  maxDays: number;
}

export function TimeControls({
  onSelectTimeRange,
  onFetchData,
  isLoading,
  timeRange,
  setTimeRange,
  maxDays,
}: TimeControlsProps) {
  const handleTimeRangeChange = (
    newValue: Date | null,
    type: "start" | "end"
  ) => {
    if (!newValue) return;

    const maxDate = new Date();
    const minDate = new Date(maxDate.getTime() - maxDays * 24 * 60 * 60 * 1000);

    if (type === "start") {
      if (newValue < minDate) newValue = minDate;
      if (newValue > timeRange.end) newValue = timeRange.end;
      setTimeRange({ ...timeRange, start: newValue });
    } else {
      if (newValue > maxDate) newValue = maxDate;
      if (newValue < timeRange.start) newValue = timeRange.start;
      setTimeRange({ ...timeRange, end: newValue });
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <DateTimePicker
            label="开始时间"
            value={timeRange.start}
            onChange={(newValue) => handleTimeRangeChange(newValue, "start")}
            maxDateTime={timeRange.end}
            minDateTime={new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000)}
          />
          <DateTimePicker
            label="结束时间"
            value={timeRange.end}
            onChange={(newValue) => handleTimeRangeChange(newValue, "end")}
            maxDateTime={new Date()}
            minDateTime={timeRange.start}
          />
        </Box>
      </LocalizationProvider>

      <ButtonGroup variant="contained" sx={{ mb: 2 }}>
        <Button onClick={() => onSelectTimeRange(30)}>30秒</Button>
        <Button onClick={() => onSelectTimeRange(5 * 60)}>5分钟</Button>
        <Button onClick={() => onSelectTimeRange(15 * 60)}>15分钟</Button>
        <Button onClick={() => onSelectTimeRange(60 * 60)}>1小时</Button>
        <Button onClick={() => onSelectTimeRange(6 * 60 * 60)}>6小时</Button>
        <Button onClick={() => onSelectTimeRange(24 * 60 * 60)}>24小时</Button>
        <Button onClick={() => onSelectTimeRange(7 * 24 * 60 * 60)}>7天</Button>
        <Button onClick={() => onSelectTimeRange(30 * 24 * 60 * 60)}>
          30天
        </Button>
        <Button onClick={onFetchData} disabled={isLoading}>
          {isLoading ? "加载中..." : "刷新"}
        </Button>
      </ButtonGroup>
    </Box>
  );
}
