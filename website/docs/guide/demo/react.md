---
title: react 子应用
slug: /guide/demo/react
order: 2
---

import WebpackConfig from '@site/src/components/config/_webpackConfig.mdx';

本节我们将详细介绍 react 框架的应用作为子应用的接入步骤。

## react 子应用接入步骤
### 1. [@garfish/bridge](../../guide/bridge) 依赖安装

:::tip
1.  请注意，桥接函数 @garfish/bridge 依赖安装不是必须的，你可以自定义导出函数。
2.  我们提供桥接函数 @garfish/bridge 是为了进一步降低用户接入成本并降低用户出错概率，我们将一些默认行为内置在桥接函数中进行了进一步封装，避免由于接入不规范导致的错误，所以这也是我们推荐的接入方式。
:::

```bash npm2yarn
npm install @garfish/bridge --save
```

### 2. 入口文件处导出 provider 函数
### react v16、v17 导出

<Tabs>
  <TabItem value="bridge_provider" label="使用 @garfish/bridge" default>

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge';
import RootComponent from './components/root';
import Error from './components/ErrorBoundary';

export const provider = reactBridge({
  React,
  ReactDOM,
  // 子应用挂载点，若子应用构建成 js ，则不需要传递该值
  el: '#root',
  // 根组件, bridge 会默认传递 basename、dom、props 等信息到根组件
  rootComponent: RootComponent,
  // 如果需要在返回根组件前做一些操作，你可以在 loadRootComponent 中进行，loadRootComponent 返回一个promise 对象，期待resolve 后得到一个应用的根组件
  loadRootComponent: ({ basename, dom, props }) => {
    // do something...
    return Promise.resolve(() => <RootComponent basename={basename} />);
  },
  // 设置应用的 errorBoundary
  errorBoundary: () => <Error />,
});
```

  </TabItem>

  <TabItem value="customer_provider" label="自定义导出函数" default>

```tsx
 // src/index.tsx
 import React from "react";
 import ReactDOM from "react-dom";
 import RootComponent from "./components/root";

 export const provider = () => {
   return {
     // 和子应用独立运行时一样，将子应用渲染至对应的容器节点，根据不同的框架使用不同的渲染方式
     render({ dom, basename, props})) {
       ReactDOM.render(<RootComponent {...props} />, root);
     },
     destroy({ dom, basename}) {
       // 使用框架提供的销毁函数销毁整个应用，已达到销毁框架中可能存在得副作用，并触发应用中的一些组件销毁函数
       // 需要注意的时一定要保证对应框架得销毁函数使用正确，否则可能导致子应用未正常卸载影响其他子应用
       ReactDOM.unmountComponentAtNode(
         dom ? dom.querySelector('#root') : document.querySelector('#root'),
       );
     },
   };
 };
```

  </TabItem>
</Tabs>

### react v18 导出
> react v18 bridge 导出方式暂未支持，目前可通过自定义导出函数导出。

```tsx
// src/index.tsx
import { createRoot } from 'react-dom/client';
import RootComponent from './root';

// 在首次加载和执行时会触发该函数
export const provider = () => {
  let root = null;
  return {
    render({ basename, dom, store, props }) {
      const container = dom.querySelector('#root');
      root = createRoot(container!);
      (root as any).render(<RootComponent basename={basename} />);
    },
    destroy({ dom }) {
      (root as any).unmount();
    },
  };
};
```
### 3. 根组件设置路由的 basename

:::info
1. 为什么要设置 basename？请参考 [issue](../../issues/childApp.md#子应用拿到-basename-的作用)
2. 我们强烈建议使用从主应用传递过来的 basename 作为子应用的 basename，而非主、子应用约定式，避免 basename 后期变更未同步带来的问题。
3. 目前主应用仅支持 history 模式的子应用路由，[why](../../issues/childApp.md#为什么主应用仅支持-history-模式)
:::

```tsx
// src/component/rootComponent
import React from "react";
import { BrowserRouter } from "react-router-dom";

const RootComponent = ({ basename }) => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### 4. 更改 webpack 配置

<WebpackConfig />

### 5. 增加子应用独立运行兼容逻辑

:::tip
last but not least, 别忘了添加子应用独立运行逻辑，这能够让你的子应用脱离主应用独立运行，便于后续开发和部署。
:::

```tsx
// src/index.tsx

if (!window.__GARFISH__) {
  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <RootComponent
      basename={
        process.env.NODE_ENV === 'production' ? '/examples/subapp/react18' : '/'
      }
    />,
  );
}
```
