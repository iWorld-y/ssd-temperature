package model

import (
	"time"
)

// Temperature 表示 SSD 温度记录
type Temperature struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	Device      string    `gorm:"type:text;not null"` // SSD名称/型号
	Temperature float64   `gorm:"type:real"`          // 温度值（摄氏度）
	CreatedAt   time.Time `gorm:"type:datetime"`      // 记录时间
}

// TableName 设置表名（可选，默认是结构体名称的复数小写形式）
func (Temperature) TableName() string {
	return "temperatures"
}
