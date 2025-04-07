package controller

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iWorld-y/ssd-temperature/service"
	"gorm.io/gorm"
)

type TemperatureController struct {
	service *service.TemperatureService
}

func NewTemperatureController(db *gorm.DB) *TemperatureController {
	return &TemperatureController{
		service: service.NewTemperatureService(db),
	}
}

// 在文件开头的 import 下面添加 DTO 结构体定义
type TemperatureDTO struct {
	ID        int32   `json:"id"`
	Device    string  `json:"device"`     // 设备名称，如 disk5
	CreatedAt int64   `json:"created_at"` // 秒级时间戳
	Value     float64 `json:"value"`
}

func (c *TemperatureController) GetTemperatures(ctx *gin.Context) {
	startTimeStr := ctx.Query("start")
	endTimeStr := ctx.Query("end")

	startTimeUnix, err := strconv.ParseInt(startTimeStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format"})
		return
	}
	startTime := time.Unix(startTimeUnix, 0)

	endTimeUnix, err := strconv.ParseInt(endTimeStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format"})
		return
	}
	endTime := time.Unix(endTimeUnix, 0)

	temps, err := c.service.GetTemperatures(startTime, endTime)
	if err != nil {
		log.Printf("Error querying temperatures: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query temperatures"})
		return
	}

	// 将 PO 转换为 DTO，并在数据量过大时进行等距抽样
	const maxDataPoints = 50
	step := 1
	pointNum := len(temps)

	if len(temps) > maxDataPoints {
		// 计算采样间隔
		step = len(temps) / maxDataPoints
		pointNum = maxDataPoints
	}

	tempDTOs := make([]*TemperatureDTO, 0, pointNum)
	for cnt := range pointNum {
		currentIndex := cnt * step
		if currentIndex >= len(temps) {
			break // 防止索引越界
		}

		temperature := temps[currentIndex]
		tempDTOs = append(tempDTOs, &TemperatureDTO{
			ID:        int32(temperature.ID),
			Device:    temperature.Device,
			CreatedAt: temperature.CreatedAt.Unix(),
			Value:     temperature.Temperature,
		})
	}
	ctx.JSON(http.StatusOK, tempDTOs)
}
