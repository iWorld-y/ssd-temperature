package service

import (
	"fmt"
	"log"
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

func (s *TemperatureService) GetTemperatures(startTime, endTime time.Time) ([]*model.Temperature, error) {
	var (
		cnt int64
		ids []int64
	)
	err := s.db.Model(&model.Temperature{}).Where("created_at BETWEEN? AND?", startTime, endTime).Count(&cnt).Error
	if err != nil {
		log.Printf("查询温度数据失败: %v", err)
		return nil, err
	}
	// 如果数据量大于 200，进行采样
	sampleNum := int64(200)
	if cnt >= sampleNum {
		// 取出第一个 ID 和最后一个 ID
		var firstID, lastID int64
		err := s.db.Model(&model.Temperature{}).
			Where("created_at BETWEEN? AND?", startTime, endTime).
			Order("id ASC").
			Limit(1).
			Pluck("id", &firstID).
			Error
		if err != nil {
			log.Printf("查询温度数据失败: %v", err)
			return nil, err
		}
		err = s.db.Model(&model.Temperature{}).
			Where("created_at BETWEEN? AND?", startTime, endTime).
			Order("id DESC").
			Limit(1).
			Pluck("id", &lastID).
			Error
		if err != nil {
			log.Printf("查询温度数据失败: %v", err)
			return nil, err
		}
		// 计算步长
		step := int64((lastID - firstID) / 50)
		// 生成 ID 列表
		for i := range sampleNum {
			ids = append(ids, firstID+i*step)
		}
	}
	var temps []*model.Temperature
	query := s.db.Where("created_at BETWEEN ? AND ?", startTime, endTime)
	if len(ids) > 0 {
		query = query.Where("id IN ?", ids)
	}
	if err := query.Find(&temps).Error; err != nil {
		log.Printf("查询温度数据失败: %v", err)
		return nil, err
	}
	return temps, nil
}
