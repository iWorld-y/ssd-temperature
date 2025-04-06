package controller

import (
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
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query temperatures"})
		return
	}

	// 将 PO 转换为 DTO
	tempDTOs := make([]TemperatureDTO, 0, len(temps))
	for _, temp := range temps {
		tempDTOs = append(tempDTOs, TemperatureDTO{
			ID:        int32(temp.ID),
			CreatedAt: temp.CreatedAt.Unix(), // 转换为秒级时间戳
			Value:     temp.Temperature,
		})
	}

	ctx.JSON(http.StatusOK, tempDTOs)
}
