---
title: Garfish.setGlobalObject
slug: /api/setGlobalObject
order: 8
---

用于子应用设置真实 window 的值。

> 在微前端应用下，子应用将默认开启沙箱模式。在沙箱模式下，子应用中全局变量为被 proxy 的 'fakeWindow'，而全局变量（真实 window）默认会被隔离。若子应用需求设置真实 window 的值，可以通过此方法获取。

:::tip
1. 一般情况下我们不建议直接通过此 API 设置真实 window；
2. 若需要设置真实 window 上的环境变量，可通过 [`protectVariable`](/api/run#protectvariable) 属性，将需要共享的属性放入列表中即可通过子应用的全局变量获取；
:::

## Type
```ts
setGlobalValue(key: string, value?: any): void;
```
## 示例

```ts
import Garfish from 'garfish';

Garfish.setGlobalValue(key: string | symbol, value: any);
```
