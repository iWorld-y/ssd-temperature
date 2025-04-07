package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/iWorld-y/ssd-temperature/controller"
	"github.com/iWorld-y/ssd-temperature/model"
	"github.com/iWorld-y/ssd-temperature/service"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Llongfile)
	db, err := gorm.Open(sqlite.Open("temperatures.sqlite3"), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
			logger.Config{
				SlowThreshold: time.Second, // 慢 SQL 阈值
				LogLevel:      logger.Info, // 日志级别
				Colorful:      true,        // 彩色打印
			}),
	})
	if err != nil {
		log.Printf("Error opening database: %v\n", err)
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
