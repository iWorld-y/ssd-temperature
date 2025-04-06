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
    - React (前端框架)
    - Material-UI (UI组件库)
    - Chart.js (图表库)

## 项目结构

```text
.
├── controller/            # 控制器层
│   └── temperature.go     # 温度数据控制器
├── model/                 # 数据模型层
│   └── temperature.go     # 温度数据模型
├── service/               # 服务层
│   └── temperature.go     # 温度数据服务
├── view/                  # 前端代码
│   ├── public/            # 公共资源
│   ├── src/               # 源代码
│   │   ├── App.js         # 主应用组件
│   │   └── ...            # 其他前端文件
│   └── package.json       # 前端依赖配置
├── go.mod                 # Go模块文件
├── go.sum                 # Go依赖校验文件
└── main.go                # 程序入口
```

## 快速开始

### 后端启动

1. 确保系统中已安装 Go 1.16 或更高版本
2. 克隆项目：

```Bash
git clone https://github.com/iWorld-y/ssd-temperature.git
```
3. 进入项目目录：

```Bash
cd ssd-temperature
```
4. 安装后端依赖：

```Bash
go mod download
```
5. 启动后端服务：

```Bash
go run main.go
```

后端服务将运行在： [http://localhost:13579](http://localhost:13579)

### 前端启动

1. 确保已安装 Node.js 和 npm/yarn
2. 进入前端目录：

```Bash
cd view
```
3. 安装前端依赖：

```Bash
npm install
```
4. 启动前端开发服务器：

```Bash
npm start
```

前端应用将运行在： [http://localhost:3000](http://localhost:3000)

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