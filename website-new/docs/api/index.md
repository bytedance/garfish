# 概览

```ts
import Garfish from "garfish";
```
在主应用中，我们通过 `import Garfish from "garfish";` 来引入 Garfish，并调用相关 Garfish api 去注册子应用或运行微前端应用。

其中，Garfish 是 `garfish` 包默认导出的实例，实例上包含微前端相关API，用户可以通过相应 API 完成对整个微前端应用的管理。


:::tip
这里需要特殊说明的是，子应用不需要额外引入 Garfish 实例，子应用可通过 `window.Garfish` 获取全局 Garfish 实例信息，参考 [Garfish 环境变量](../guide/quickStart/env.md)。


:::


## Garfish 实例方法
- [Garfish.run](/api/run) （用于初始化应用参数、启动路由监听，当路由发生变化时自动激活应用或销毁应用）
- [Garfish.registerApp](/api/registerApp)（用于动态注册应用信息）
- [Garfish.loadApp](/api/loadApp)（可以手动控制子应用加载和销毁）
- [Garfish.router](/api/router)（提供路由跳转和路由守卫能力）
- [Garfish.channel](/api/channel)（提供应用间通信的能力）
- [Garfish.setExternal](/api/setExternal)（支持应用间的依赖共享）
- [Garfish.getGlobalObject](/api/getGlobal)（用于获取真实 Window）
- [Garfish.setGlobalObject](/api/setGlobal)（用于设置真实 Window 的值）
- [Garfish.clearEscapeEffect](/api/clearEscapeEffect)（用于清除逃逸的副作用）
