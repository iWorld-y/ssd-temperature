# SSD 温度监控

这是一个用于监控 NVMe SSD 温度的 Web 应用程序。该应用程序每秒读取 SSD 的温度数据，并通过 Web 界面以图表的形式展示温度变化趋势。

## 功能特点

- 实时监控 NVMe SSD 温度
- Web 界面展示温度变化趋势图
- 支持自定义时间范围查询
- 提供多个快捷时间范围选择（30秒至12小时）
- 数据持久化存储

## 技术栈

- 后端：
    - Go
    - Gin (Web 框架)
    - GORM (ORM 框架)
    - SQLite (数据库)
    - smart.go (NVMe 设备读取库)
- 前端：
    - HTML/CSS/JavaScript
    - Chart.js (图表库)

## 项目结构

```text
.
├── controller/
│   └── temperature.go    # 温度数据控制器
├── model/
│   └── temperature.go    # 温度数据模型
├── service/
│   └── temperature.go    # 温度数据服务层
├── view/
│   └── index.html       # Web 界面
└── main.go              # 程序入口
```

## 快速开始

1. 确保系统中已安装 Go 1.16 或更高版本
2. 克隆项目：

```Bash
git clone https://github.com/iWorld-y/ssd-temperature.git
```
3. 进入项目目录：

```Bash
cd ssd-temperature
```
4. 安装依赖：

```Bash
go mod download
```
5. 运行程序：

```Bash
go run main.go
```
6. 在浏览器中访问： [http://localhost:8080](http://localhost:8080)

## 使用说明

1. 程序启动后会自动开始监控 SSD 温度（默认监控 "disk5"）
2. Web 界面提供以下功能：
    - 自定义时间范围查询
    - 快捷时间范围选择按钮
    - 温度变化趋势图表显示
3. 温度数据会自动保存到 SQLite 数据库中

## 注意事项

- 需要确保程序有足够的权限访问 NVMe 设备
- 默认监控设备为 "disk5"，如需更改请修改 main.go 中的设备名称
- 数据库文件默认保存为 "temperatures.sqlite3"