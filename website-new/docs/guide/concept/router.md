# 路由机制

为什么需要 `Router`，其实从现在主流的前端框架可以发现他们都是可以通过路由驱动的，开发者只需要配置路由的 `map` 规则，即可在进入指定路由后载入子应用。这无疑大大降低了单页应用的复杂度，微前端上我们也可以借用单页应用的路由驱动模式，将每个子应用作为组件，并且只托管子应用的根路由，二级及以下路由交由子应用自己负责。其他比较复杂的情况，可以通过与手动载入配合。

![image](https://user-images.githubusercontent.com/27547179/165110838-2f907b10-40b4-4e00-afab-808ef08d1570.png)

`Garfish Router` 如何处理路由，通过上面理想的路由模式案例发现，微前端应用拆分成子应用后，子应用路由应具备自治能力，可以充分的利用应用解耦后的开发优势，但与之对应的是应用间的路由可能会发生冲突、两种路由模式下可能产生用户难以理解的路由状态、无法激活不同前端框架的下带来的视图无法更新等问题。

> 目前 `Garfish` 主要提供了以下三条策略

- 提供 `Router Map`，减少典型中台应用下的开发者理解成本
- 为不同子应用提供不同的 `basename` 用于隔离应用间的路由抢占问题
- 路由发生变化时能准确激活并触发应用视图更新

## `Router Map` 降低开发者理解成本

在典型的中台应用中，通常可以将应用的结构分为两块，一块是菜单另一块则是内容区域，依托于现代前端 Web 应用的设计理念的启发，通过提供路由表来自动化完成子应用的调度，将公共部分作为拆离后的子应用渲染区域。

## 提供 basename

在自动挂载模式下 `Garfish` 会根据用户提供的 `activeWhen` 自动计算出子应用的 basename，子应用使用该 `basename` ，子应用设置 basename 后可以保证应用间的路由互不影响且能达到多个微前端应用组合成单个 `SPA` 应用的体验，并且这些微前端应用能具备自己的路由。

## 如何有效的触发不同应用间的视图更新

目前主流框架实现路由的方式并不是监听路由变化触发组件更新，让开发者通过框架包装后的 API 进行跳转，并内部维护路由状态，在使用框架提供 API 方法发生路由更新时，内部状态发生变更触发组件更新。

由于框架的路由状态分别维护在各自的内部，那么如何保证在路由发生变化时能及时有效的触发应用的视图更新呢，答案是可以的，目前主要有两种实现策略：

1. 收集框架监听的 `popstate` 事件
2. 主动触发 `popstate` 事件
   因为目前支持 SPA 应用的前端框架都会监听浏览器后退事件，在浏览器后退时根据路由状态触发应用视图的更新，那么其实也可以利用这种能力主动触发应用视图的更新，可以通过收集框架的监听事件，也可以触发 `popstate` 来响应应用的 `popstate` 事件
