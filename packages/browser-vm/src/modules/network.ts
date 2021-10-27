import { hasOwn, isAbsolute, transformUrl } from '@garfish/utils';
import { Sandbox } from '../sandbox';

export function networkModule(sandbox: Sandbox) {
  const baseUrl = sandbox.options.baseUrl;
  const xhrSet = new Set<fakeXMLHttpRequest>();
  const fetchSet = new Set<AbortController>();
  const needFix = (url) =>
    baseUrl && typeof url === 'string' && !isAbsolute(url);

  class fakeXMLHttpRequest extends XMLHttpRequest {
    constructor() {
      super();
      xhrSet.add(this);
    }

    open() {
      // Async request
      if (arguments[3] === false) {
        xhrSet.delete(this);
      }
      if (needFix(arguments[1])) {
        arguments[1] = transformUrl(baseUrl, arguments[1]);
      }
      return super.open.apply(this, arguments);
    }
  }

  // `fetch` is not constructor
  const fakeFetch = (input, options: RequestInit = {}) => {
    if (needFix(input)) {
      input = transformUrl(baseUrl, input);
    }
    let controller;
    if (!hasOwn(options, 'signal') && window.AbortController) {
      controller = new window.AbortController();
      fetchSet.add(controller);
      options.signal = controller.signal;
    }
    return controller
      ? window.fetch(input, options).finally(() => fetchSet.delete(controller))
      : window.fetch(input, options);
  };

  return {
    override: {
      fetch: window.fetch ? fakeFetch : undefined,
      XMLHttpRequest: fakeXMLHttpRequest as unknown as XMLHttpRequest,
    },
    recover() {
      xhrSet.forEach((xhr) => xhr.abort());
      fetchSet.forEach((ctor) => ctor.abort());
      xhrSet.clear();
      fetchSet.clear();
    },
  };
}