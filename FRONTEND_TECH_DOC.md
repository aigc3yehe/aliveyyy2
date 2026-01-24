# $活着呢 DApp - 前端技术文档

> 为后端开发和前后端联调提供的完整技术参考

## 目录

- [技术栈概览](#技术栈概览)
- [项目架构](#项目架构)
- [核心数据模型](#核心数据模型)
- [状态管理](#状态管理)
- [API 集成点](#api-集成点)
- [前后端接口规范](#前后端接口规范)
- [本地开发](#本地开发)

---

## 技术栈概览

### 核心框架

- **React 18.3.1**: UI 框架
- **TypeScript**: 类型安全
- **Vite 6.3.5**: 构建工具，快速开发服务器
- **React Router 7.12.0**: 客户端路由

### 状态管理

- **Zustand 5.0.10**: 轻量级状态管理库（主要）
- **@tanstack/react-query 5.90.19**: 服务器状态管理（用于 API 缓存和同步）

### UI 库

- **Tailwind CSS 4.1.12**: 原子化 CSS
- **Radix UI**: 无头组件库（Accessibility 优先）
- **Motion 12.23.24**: 动画库
- **Lucide React**: 图标库
- **Sonner**: Toast 通知

### Web3 集成

- **Wagmi 3.4.1**: React hooks for Ethereum
- **Viem 2.44.4**: TypeScript Ethereum library

### 音频 & 多媒体

- 原生 `<audio>` API
- WebP 图片格式优化

---

## 项目架构

### 目录结构

```
src/
├── app/
│   ├── components/         # 可复用组件
│   │   ├── ui/            # UI 基础组件 (shadcn/ui)
│   │   ├── AliveTokenDisplay.tsx
│   │   ├── ClaimModal.tsx
│   │   ├── DevControlPanel.tsx  # 开发调试面板
│   │   ├── InfoModal.tsx
│   │   ├── SoundManager.tsx
│   │   ├── StatsIndicators.tsx
│   │   └── UnconnectedScreen.tsx
│   ├── config/            # 配置文件
│   │   └── interactionAnimations.ts
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useGameLoop.ts   # 游戏主循环
│   │   └── useSound.ts      # 音效管理
│   ├── pages/             # 页面组件
│   │   ├── Home.tsx         # 主游戏界面
│   │   ├── Leaderboard.tsx  # 排行榜
│   │   └── Store.tsx        # 商店
│   ├── stores/            # Zustand 状态管理
│   │   ├── useGameStore.ts       # 游戏核心状态
│   │   └── useDecorationStore.ts # 装饰/皮肤状态
│   ├── App.tsx
│   └── routes.tsx
├── assets/               # 静态资源（图片、音频）
├── styles/              # 全局样式
│   ├── fonts.css
│   ├── index.css        # 全局样式入口
│   ├── tailwind.css
│   └── theme.css
└── utils/
    └── format.ts        # 工具函数
```

### 页面路由

```typescript
// src/app/routes.tsx
const router = createBrowserRouter([
  { path: '/', element: <Home /> },           // 主游戏页面
  { path: '/store', element: <Store /> },     // 商店
  { path: '/leaderboard', element: <Leaderboard /> }  // 排行榜
]);
```

---

## 核心数据模型

### 1. 游戏状态 (`GameState`)

```typescript
interface GameState {
  // 核心生存指标
  hp: number; // 当前 HP (0-48)
  maxHp: number; // 最大 HP (固定 48)
  lastCheckInTime: number; // 上次签到时间戳（Unix seconds）
  isAlive: boolean; // 是否存活（hp > 0）

  // 经济系统
  aliveBalance: number; // 已领取的 $活着呢 余额
  pendingAlive: number; // 待领取的 $活着呢

  // 生存进度
  streaks: number; // 连续存活天数
  survivalMultiplier: number; // 生存系数 (1.0+)
  dopamineIndex: number; // 多巴胺指数 (1.0+)

  // UI 状态
  isPending: boolean; // 是否有待处理操作
  audioState: "all" | "sfx_only" | "mute"; // 音频状态
  language: "en" | "cn"; // 语言

  // 钱包连接
  isConnected: boolean; // 钱包是否连接
  walletAddress: string; // 钱包地址
}
```

### 2. 装饰/皮肤配置 (`DecorationConfig`)

```typescript
type DecorationLayer =
  | "background"
  | "holographic"
  | "photo"
  | "player"
  | "bed"
  | "stove";

interface DecorationConfig {
  background: "default";
  holographic: "default";
  photo: "default";
  player: "default";
  bed: "default" | "doll"; // 床样式
  stove: "default";
}
```

### 3. 商店物品 (`StoreItem`)

```typescript
interface StoreItem {
  id: string; // 物品 ID
  name: string; // 名称（支持多语言）
  description: string; // 描述
  price: number; // 价格（$活着呢）
  priceType: "alive" | "eth"; // 货币类型
  image?: string; // 封面图片
  icon?: string; // Emoji 图标
}
```

### 4. 排行榜玩家 (`LeaderboardPlayer`)

```typescript
interface LeaderboardPlayer {
  rank: number; // 排名
  address: string; // 钱包地址
  hp: number; // 当前 HP
  streaks: number; // 连续天数
  alive: number; // $活着呢 总量
  avatar: string; // 头像（Emoji）
}
```

---

## 状态管理

### Zustand Store 设计

#### 1. `useGameStore` - 游戏核心逻辑

**关键方法**:

```typescript
// 钱包连接
connectWallet(): void

// 签到/复活
checkIn(): void
/*
  逻辑:
  - 如果 hp <= 0: 复活到 1 HP
  - 如果 hp > 0: 恢复 1 HP
  - 增加 dopamineIndex (+0.1)
  - 增加 streaks (+1)
  - 增加 pendingAlive (10 * dopamineIndex)
*/

// HP 时间衰减更新
updateHpFromTime(): void
/*
  每小时 -1 HP
  HP = maxHp - floor((now - lastCheckInTime) / 3600)
*/

// 领取 $活着呢
claimAlive(): void
/*
  aliveBalance += pendingAlive
  pendingAlive = 0
  dopamineIndex = 1.0 (重置)
*/

// 购买物品
buyItem(itemId: string, price: number): void
```

#### 2. `useDecorationStore` - 装饰管理

**关键方法**:

```typescript
// 获取用户装饰配置（从服务器）
fetchDecorations(): Promise<void>

// 设置装饰
setDecoration(layer: DecorationLayer, variant: string): void

// 点击交互动画
handleLayerClick(layer: DecorationLayer): void
```

**本地缓存**:

- 使用 `localStorage` 缓存装饰配置
- 缓存有效期: 5 分钟
- Key: `alive_decoration_config`

---

## API 集成点

### 需要后端支持的功能

#### 1. 用户认证 & 钱包绑定

```typescript
// POST /api/auth/connect
Request: {
  address: string; // 钱包地址
  signature: string; // 签名
  message: string; // 签名消息
}

Response: {
  token: string; // JWT Token
  user: {
    id: string;
    address: string;
    createdAt: number;
  }
}
```

#### 2. 同步游戏状态

```typescript
// GET /api/game/state
Headers: {
  Authorization: "Bearer <token>";
}

Response: {
  hp: number;
  lastCheckInTime: number;
  aliveBalance: number;
  pendingAlive: number;
  streaks: number;
  survivalMultiplier: number;
  dopamineIndex: number;
}

// POST /api/game/checkin
Headers: {
  Authorization: "Bearer <token>";
}

Request: {
  timestamp: number; // 客户端时间戳（防作弊验证）
}

Response: {
  success: boolean;
  newState: GameState; // 更新后的游戏状态
  reward: number; // 本次获得的 $活着呢
}
```

#### 3. 获取/更新装饰配置

```typescript
// GET /api/decorations
Headers: {
  Authorization: "Bearer <token>";
}

Response: {
  config: DecorationConfig;
}

// PUT /api/decorations
Headers: {
  Authorization: "Bearer <token>";
}

Request: {
  layer: DecorationLayer;
  variant: string;
}

Response: {
  success: boolean;
  config: DecorationConfig;
}
```

#### 4. 排行榜

```typescript
// GET /api/leaderboard?limit=50&offset=0
Response: {
  players: LeaderboardPlayer[];
  total: number;
  userRank?: number;        // 当前用户排名
}
```

#### 5. 商店购买

```typescript
// POST /api/store/purchase
Headers: { Authorization: 'Bearer <token>' }

Request: {
  itemId: string;
  price: number;
  currency: 'alive' | 'eth';
}

Response: {
  success: boolean;
  transactionId?: string;
  newBalance: number;
}
```

---

## 前后端接口规范

### 通用规范

#### HTTP Headers

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
X-Client-Version: 0.0.1
```

#### 响应格式

```typescript
// 成功响应
{
  success: true,
  data: { ... },
  timestamp: 1706083200
}

// 错误响应
{
  success: false,
  error: {
    code: 'INSUFFICIENT_BALANCE' | 'INVALID_TOKEN' | ...,
    message: 'Human readable error message',
  },
  timestamp: 1706083200
}
```

#### 错误码定义

- `UNAUTHORIZED`: 未授权
- `INVALID_TOKEN`: Token 无效
- `INSUFFICIENT_BALANCE`: 余额不足
- `ITEM_NOT_FOUND`: 物品不存在
- `RATE_LIMIT`: 请求频率限制
- `SERVER_ERROR`: 服务器错误

### 时间同步策略

**问题**: HP 衰减依赖时间，客户端时间可能被篡改

**解决方案**:

1. 所有时间计算在服务器端进行
2. 客户端发送 `lastCheckInTime` 和当前操作时间戳
3. 服务器使用自己的时间戳计算 HP
4. 客户端仅用于 UI 预览（每秒更新）

```typescript
// useGameLoop.ts - 客户端预览逻辑
setInterval(() => {
  updateHpFromTime(); // 本地计算，仅用于 UI
}, 1000);

// 实际操作时发送到后端验证
await fetch("/api/game/checkin", {
  body: JSON.stringify({
    clientTime: Date.now(),
    lastCheckInTime: gameStore.lastCheckInTime,
  }),
});
```

### WebSocket 实时同步（可选）

```typescript
// 连接 WebSocket
const ws = new WebSocket("wss://api.alive.xyz/ws");

// 监听游戏状态更新
ws.on("game:state:update", (data: GameState) => {
  gameStore.setState(data);
});

// 监听排行榜变化
ws.on("leaderboard:update", (data: LeaderboardPlayer[]) => {
  // 更新排行榜
});
```

---

## 本地开发

### 环境要求

- Node.js >= 18
- npm 或 pnpm

### 启动开发服务器

```bash
npm install
npm run dev
# 访问 http://localhost:5173
```

### 构建生产版本

```bash
npm run build
# 输出到 dist/
```

### Mock 后端 API（推荐）

使用 [MSW (Mock Service Worker)](https://mswjs.io/) 或直接在前端返回 Mock 数据：

```typescript
// src/api/mockApi.ts
export const mockCheckIn = async (): Promise<GameState> => {
  await new Promise((r) => setTimeout(r, 500)); // 模拟网络延迟
  return {
    hp: 43,
    lastCheckInTime: Date.now() / 1000,
    // ...
  };
};
```

### 开发者工具

**DevControlPanel**:

- 位置: 右下角齿轮图标
- 功能:
  - 切换生存/失联状态
  - 更换床样式
  - 查看当前 HP

**浏览器 DevTools**:

- 使用 [Zustand DevTools](https://github.com/pmndrs/zustand#devtools) 查看状态变化
- 使用 React DevTools 调试组件

---

## 关键业务逻辑

### HP 衰减机制

```typescript
// 公式
HP = maxHp - floor((currentTime - lastCheckInTime) / 3600)

// 示例
maxHp = 48
lastCheckInTime = 1706000000  // 某个时间点
currentTime = 1706003600      // 1 小时后

HP = 48 - floor((1706003600 - 1706000000) / 3600)
   = 48 - floor(3600 / 3600)
   = 48 - 1
   = 47
```

### 代币奖励计算

```typescript
// 每次签到获得的 $活着呢
reward = 10 * dopamineIndex

// 例如
dopamineIndex = 2.5
reward = 10 * 2.5 = 25 $活着呢
```

### 多巴胺指数机制

```typescript
// 每次签到
dopamineIndex += 0.1;

// 领取代币时重置
dopamineIndex = 1.0;
```

---

## 注意事项

### 安全建议

1. **所有关键计算在后端完成**: HP 计算、代币发放、购买验证
2. **客户端仅用于 UI**: 前端状态仅供展示，不能作为真实数据来源
3. **签到防作弊**: 服务器记录签到时间间隔，防止频繁签到
4. **钱包签名验证**: 登录/操作需验证钱包签名

### 性能优化

1. **懒加载**: 商店、排行榜等页面按需加载
2. **图片优化**: 使用 WebP 格式，压缩资源
3. **状态缓存**: Zustand 配合 localStorage 持久化
4. **API 缓存**: React Query 缓存服务器数据

### 多语言支持

- 当前支持: 英文 (`en`) / 中文 (`cn`)
- 切换位置: 右上角功能按钮
- 实现方式: 三元运算符 `language === 'en' ? 'Text' : '文本'`

---

## 联系 & 协作

### 前端开发者

- 技术栈问题请参考本文档
- 新功能开发请提交 Pull Request
- UI/UX 设计调整请在 Figma 协作

### 后端开发者

- API 规范请严格遵循"前后端接口规范"章节
- 时间同步逻辑参考"时间同步策略"
- WebSocket 集成为可选功能

### 项目经理/产品

- 游戏机制调整需同步更新本文档
- 新增功能需先定义数据模型和 API

---

**文档版本**: v1.0  
**最后更新**: 2026-01-24  
**维护者**: Frontend Team
