package main

import (
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/iWorld-y/ssd-temperature/controller"
	"github.com/iWorld-y/ssd-temperature/model"
	"github.com/iWorld-y/ssd-temperature/service"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("temperatures.sqlite3"), &gorm.Config{})
	if err != nil {
		fmt.Printf("Error opening database: %v\n", err)
		return
	}

	// Auto migrate the schema
	db.AutoMigrate(&model.Temperature{})

	// Start HTTP server
	r := gin.Default()

	// 使用默认CORS配置
	r.Use(cors.Default())

	tempController := controller.NewTemperatureController(db)

	// API routes
	r.GET("/getTemperatures", tempController.GetTemperatures)

	// Start temperature monitoring in goroutine
	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()

		tempService := service.NewTemperatureService(db)

		for range ticker.C {
			_, err := tempService.ReadAndStoreTemperature("disk5")
			if err != nil {
				fmt.Printf("Error: %v\n", err)
				continue
			}
		}
	}()

	// Start HTTP server
	r.Run(":13579")
}
