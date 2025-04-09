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
	"golang.org/x/sync/errgroup"
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
	quiteDB, err := gorm.Open(sqlite.Open("temperatures.sqlite3"), &gorm.Config{})
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

	tempController := controller.NewTemperatureController(db, quiteDB)

	// 获取温度数据
	r.GET("/getTemperatures", tempController.GetTemperatures)
	// 获取物理硬盘列表
	r.GET("/listPhysicalDisks", tempController.ListPhysicalDisks)

	disks, err := tempController.InnerListPhysicalDisks()
	if err != nil {
		log.Fatalf("Error listing physical disks: %v\n", err)
	}

	var errg errgroup.Group
	errg.SetLimit(10)

	for _, disk := range disks {
		// Start temperature monitoring in goroutine
		errg.Go(func() error {
			ticker := time.NewTicker(time.Second)
			defer ticker.Stop()

			tempService := service.NewTemperatureService(db, quiteDB)

			for range ticker.C {
				_, err := tempService.ReadAndStoreTemperature(disk)
				if err != nil {
					fmt.Printf("Error: %v\n", err)
					return err
				}
			}
			return nil
		})
	}
	// 启动温度监控
	go func() {
		if err := errg.Wait(); err != nil {
			log.Fatalf("Error in temperature monitoring: %v\n", err)
		}
	}()

	// Start HTTP server
	if err := r.Run(":13579"); err != nil {
		log.Fatalf("Error starting HTTP server: %v\n", err)
	}
}
