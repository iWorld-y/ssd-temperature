package service

import (
	"fmt"
	"math"
	"time"

	"github.com/anatol/smart.go"
	"github.com/iWorld-y/ssd-temperature/model"
	"gorm.io/gorm"
)

type TemperatureService struct {
	db *gorm.DB
}

func NewTemperatureService(db *gorm.DB) *TemperatureService {
	return &TemperatureService{db: db}
}

func (s *TemperatureService) DB() *gorm.DB {
	return s.db
}

func (s *TemperatureService) ReadAndStoreTemperature(device string) (float64, error) {
	dev, err := smart.OpenNVMe(device)
	if err != nil {
		return 0, fmt.Errorf("打开设备失败: %v", err)
	}
	defer dev.Close()

	sm, err := dev.ReadSMART()
	if err != nil {
		return 0, fmt.Errorf("读取SMART数据失败: %v", err)
	}

	temp := math.Round((float64(sm.Temperature)-273.15)*100) / 100
	err = s.db.Create(&model.Temperature{Temperature: temp}).Error
	if err != nil {
		return temp, fmt.Errorf("存储温度数据失败: %v", err)
	}

	return temp, nil
}

func (s *TemperatureService) GetTemperatures(startTime, endTime time.Time) ([]model.Temperature, error) {
	var temps []model.Temperature
	if err := s.db.Where("created_at BETWEEN ? AND ?", startTime, endTime).Find(&temps).Error; err != nil {
		return nil, err
	}
	return temps, nil
}
