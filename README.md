# 四川车险市场数据可视化分析

基于 React + TypeScript + DuckDB-WASM + ECharts 的车险市场数据分析网页应用。

## 功能特性

- **数据导入**：支持拖拽上传 Parquet 文件，或加载默认数据
- **仪表盘**：KPI 卡片、月度趋势图、地市/公司 TOP10 排名
- **多维筛选**：年月、地市、险种、保险公司多选筛选
- **分析模块**：地市分析、公司市场份额分析、险种结构分析

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **数据处理**：DuckDB-WASM（浏览器端 SQL 查询）
- **可视化**：ECharts 5
- **样式**：Tailwind CSS

## 快速开始

### 安装 Bun（如未安装）

```bash
# Windows (PowerShell)
irm bun.sh/install.ps1 | iex

# macOS / Linux
curl -fsSL https://bun.sh/install | bash
```

### 安装依赖

```bash
bun install
```

### 启动开发服务器

```bash
bun run dev
```

打开浏览器访问 http://localhost:5173

### 构建生产版本

```bash
bun run build
```

## 项目结构

```
src/
├── app/                    # 应用入口
│   ├── App.tsx            # 主组件
│   └── main.tsx           # 入口文件
├── features/              # 功能模块
│   ├── home/              # 数据导入页
│   ├── dashboard/         # 仪表盘
│   ├── filters/           # 筛选器
│   └── analysis/          # 分析模块
├── shared/                # 共享模块
│   ├── duckdb/            # DuckDB 客户端
│   ├── sql/               # SQL 生成工具
│   ├── ui/                # 通用 UI 组件
│   └── styles/            # 全局样式
└── vite-env.d.ts          # Vite 类型声明
```

## 数据字段

| 字段 | 说明 |
|------|------|
| 年月 | 数据月份（如 2024-01） |
| 地市 | 地市名称 |
| 险种 | 保险险种 |
| 保险 | 保险公司名称 |
| 标准保费 | 标准保费金额 |
| 标准件数 | 保单件数 |

## 许可证

MIT
