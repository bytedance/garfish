/// <reference types="cypress" />

import GarfishInstance from 'garfish';
import { Config } from './config';

GarfishInstance.router.beforeEach((to, from, next) => {
  next();
});
GarfishInstance.run(Config);

const useRouterMode = false;
let prevApp = null;
document.getElementById('vueBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vue', '/garfish_master/vue'); // use router to load app
  } else {
    if (prevApp) prevApp.unmount();
    prevApp = await GarfishInstance.loadApp('vue', {
      entry: 'http://localhost:2666',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    prevApp && (await prevApp.mount());
  }
};

document.getElementById('reactBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'react', '/garfish_master/react');
  } else {
    if (prevApp) prevApp.unmount();
    prevApp = await GarfishInstance.loadApp('react', {
      entry: 'http://localhost:2444',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    prevApp && (await prevApp.mount());
  }
};

// Plugin test
const hooks = GarfishInstance.createPluginSystem(({ SyncHook, AsyncHook }) => {
  return {
    create: new AsyncHook<[number], string>(),
  };
});

hooks.usePlugin({
  name: 'test',
  create(a) {
    console.log(a);
    return '';
  },
});

hooks.lifecycle.create.emit(123);
