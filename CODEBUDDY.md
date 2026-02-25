# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 常用命令

- **bun run dev** - 启动开发服务器，需要 COOP/COEP 响应头，访问 http://localhost:5173
- **bun run build** - TypeScript 编译 + Vite 构建，输出到 dist/
- **bun run preview** - 预览生产构建
- **bun test** - 运行 Vitest 测试
- **bun run lint** - ESLint 检查 src 目录下的 .ts/.tsx 文件

## 技术栈与项目架构

这是一个基于 React + TypeScript + DuckDB-WASM + ECharts 的四川车险市场数据可视化应用。

### 核心架构

**数据流**：Parquet 文件 → DuckDB-WASM 内存数据库 → SQL 查询 → React 状态 → ECharts 渲染

1. **DuckDB-WASM 层** (`shared/duckdb/`)
   - `client.ts` - 底层 DuckDB 实例管理，提供 SQL 查询能力
   - `context.tsx` - React Context 封装，全局状态管理数据加载状态和查询接口
   - 使用 jsDelivr CDN 加载 DuckDB WASM bundle
   - 单表结构：数据加载后创建 `car_insurance` 表

2. **SQL 工具层** (`shared/sql/`)
   - `filters.ts` - 根据 FilterState 生成 WHERE 子句，处理 SQL 注入转义

3. **功能模块** (`features/`)
   - `home/` - 数据导入页，支持拖拽上传 Parquet 或加载默认数据
   - `dashboard/` - 仪表盘主容器，管理标签页和 KPI/趋势/排名数据获取
   - `filters/` - 筛选器组件，年月/地市/险种/公司多选筛选
   - `analysis/` - 深度分析模块（地市/公司/险种分析）

### 页面路由

使用简单状态路由 (`home` | `dashboard`)，由 App.tsx 控制：
- 数据未加载时 → 显示 Home 页面
- 数据加载成功 → 自动跳转到 Dashboard 页面

### 数据模型

Parquet 文件必须包含以下字段：
- `年月` - 数据月份（如 2024-01）
- `地市` - 地市名称
- `险种` - 保险险种
- `保险` - 保险公司名称
- `标准保费` - 保费金额
- `标准件数` - 保单件数

### 配置要点

**vite.config.ts** - 关键配置：
- 配置 COOP/COEP 响应头以启用 SharedArrayBuffer（DuckDB-WASM 必需）
- `@` 路径别名指向 `./src`
- `optimizeDeps.exclude` 排除 `@duckdb/duckdb-wasm`（自行管理）

**tsconfig.json** - 严格模式开启：
- `noUnusedLocals` / `noUnusedParameters` 启用
- `noUncheckedIndexedAccess` 启用
- `moduleResolution: bundler` + `allowImportingTsExtensions: true`

### 组件开发规范

- 所有组件使用函数组件 + Hooks
- 数据获取使用 useEffect + async/await
- 使用 `useDuckDB()` Hook 获取数据库查询能力
- FilterState 通过 props 层层传递，不使用全局状态管理库

### 样式系统

- Tailwind CSS 3.x
- 自定义 `primary` 色彩体系（blue-50 到 blue-900）
- 通用 UI 组件在 `shared/ui/`：Header、KPICard、Loading

### 构建注意事项

1. DuckDB-WASM 需要 COOP/COEP 头，开发服务器已自动配置
2. 生产构建目标 `esnext`，利用现代浏览器特性
3. 包管理使用 Bun，但 npm/yarn 也可兼容

### 默认数据

项目包含 `public/四川车险市场分月数据.parquet` 作为默认数据集，用户可通过 URL 加载或直接拖拽上传自己的 Parquet 文件。
