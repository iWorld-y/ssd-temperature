package controller

import (
	"log"
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/iWorld-y/ssd-temperature/service"
	"github.com/iWorld-y/ssd-temperature/utils"
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

	temps = utils.Sample(temps, 50)
	tempDTOs := make([]*TemperatureDTO, len(temps))
	for i, temp := range temps {
		tempDTOs[i] = &TemperatureDTO{
			ID:        int32(temp.ID),
			Device:    temp.Device,
			CreatedAt: temp.CreatedAt.Unix(),
			Value:     math.Round(temp.Temperature*100) / 100,
		}
	}
	ctx.JSON(http.StatusOK, tempDTOs)
}
