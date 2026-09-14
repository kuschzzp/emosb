# 帮我选

一个轻量、私密的随机决策工具。默认提供“今天吃什么”清单，也可以创建自己的旅行、活动或待办清单，把选择交给手气。

## 功能

- 从当前清单中随机抽取一个选项
- 创建、切换、编辑和删除多份清单
- 自动清理空行和重复选项
- 为每份清单保留最近 6 次结果
- 兼容旧版菜单数据
- 所有数据只保存在当前浏览器的 `localStorage` 中
- 支持移动端布局和系统的“减少动态效果”偏好

## 技术栈

- Vue 2.6
- Vue CLI 5
- Element UI 2.15（按需引入）
- Node.js 内置测试运行器

## 本地开发

```bash
cd decision-app
npm install
npm run serve
```

开发服务器启动后，按照终端输出访问本地地址。

## 常用命令

```bash
npm run serve      # 启动开发服务器
npm run test:unit  # 运行存储逻辑单元测试
npm run lint       # 检查代码规范
npm run build      # 构建生产版本
```

## 项目结构

```text
decision-app/
├── public/                 # HTML 模板和浏览器图标
├── src/
│   ├── components/         # 抽取区、历史记录和清单管理组件
│   ├── styles/theme.css    # 全局主题与 Element UI 样式覆盖
│   ├── utils/storage.js    # 数据校验、迁移和持久化
│   ├── App.vue             # 页面与业务流程
│   └── main.js             # 应用入口
└── tests/storage.test.js   # 存储逻辑测试
```

## 数据规则

- 清单名称不能为空，最多 20 个字符，且不能重名
- 每份清单需要保留 2 至 200 个有效选项
- 同一清单中的空行和重复选项会在保存时自动移除
- 每份清单最多保留 6 条抽取历史
- 应用没有后端、账号系统或云同步；清除站点数据会一并删除清单
