package model

import (
	"gorm.io/gorm"
)

type Temperature struct {
	gorm.Model
	Value float64
}
