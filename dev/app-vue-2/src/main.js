import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import About from './components/About.vue';
import Index from './components/Index.vue';
import { vueBridge } from '@garfish/bridge';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const routes = [
  { path: '/about', component: About },
  { path: '/index', component: Index },
];

if (!window.__GARFISH__) {
  const router = new VueRouter({
    mode: 'history',
    routes,
    base: '/examples/subapp/vue2',
  });

  new Vue({
    router,
    render: (h) => h(App),
  }).$mount('#app');
}

function newRouter(basename) {
  const router = new VueRouter({
    mode: 'history',
    routes,
    base: basename,
  });
  return router;
}

/***
 * 子应用提供 provider 函数:
 */
// let vm;
// export function provider({ dom , basename }) {
//   return {
//     render() {
//       vm = new Vue({
//         router: newRouter(basename),
//         render: (h) => h(App),
//       }).$mount();
//       dom.appendChild(vm.$el);
//     },
//     destroy() {
//       vm.$destroy();
//       vm.$el.parentNode && vm.$el.parentNode.removeChild(vm.$el);
//     },
//   };
// }

/***
 * 使用 vueBridge 函数:
 */
export const provider = vueBridge({
  Vue,
  rootComponent: App,
  appOptions: ({ appInfo }) => {
    return {
      el: '#app',
      router: newRouter(appInfo.basename),
    };
  },
});