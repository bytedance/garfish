# Garfish.setExternal

用于实现主、子应用间依赖共享。


:::tip
1. 主、子应用若开启进行依赖共享能力，需要构建成 'umd' 规范且保证 `jsonpFunction` 唯一；[参考](/guide/build-config)；
2. 若子应用通过依赖共享主应用核心包，则子应用将不能独立运行；
3. 主应用的若升级版本会可能会对子应用产生影响；
4. external 的内容会逃逸 vm 沙箱；

:::

> 请注意，Garfish.setExternal 是 garfish 提供的用于实现应用间的依赖共享的 API，通过该 API 可将依赖进行注册并在注册完成后可实现主子应用的依赖共享。但可能会由于共享带来某些依赖的影响，若出现问题我们建议关闭共享机制。

## 类型
```ts
setExternal(nameOrExtObj: string | Record<string, any>, value?: any): Garfish;
```
## 示例
### 主应用

- 主应用 webpack 配置
```js
// 主应用 webpack.config.js
module.exports = {
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 请求确保该值与子应用的值不相同避免与子应用发生影响
    jsonpFunction: 'main-app-jsonpFunction'
  },
};
```
- 设置 external
```ts
// 主应用 index.ts
import React from 'react';
import * as ReactDom from 'react-dom';
import * as mobxReact from 'mobx-react';
import * as ReactRouterDom from 'react-router-dom';
import Garfish from 'garfish';

Garfish.setExternal({
  react: React,
  'react-dom': ReactDom,
  'react-router-dom': ReactRouterDom,
  'mobx-react': mobxReact,
});
```
### 子应用

```js
// 子应用 webpack.config.js
module.exports = {
  output: {
    // 需要配置成 umd 规范
    libraryTarget: 'umd',
    // 修改不规范的代码格式，避免逃逸沙箱
    globalObject: 'window',
    // 请求确保每个子应用该值都不相同，否则可能出现 webpack chunk 互相影响的可能
    jsonpFunction: 'vue-app-jsonpFunction',
    // 保证子应用的资源路径变为绝对路径，避免子应用的相对资源在变为主应用上的相对资源，因为子应用和主应用在同一个文档流，相对路径是相对于主应用而言的
    publicPath: 'http://localhost:8000'
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    'react-router-dom': 'react-router-dom',
    'mobx-react': 'mobx-react'
  }
};
```
