import portMap from './config.json';

const isInWebIDE = () => {
  return Boolean(process.env.IDE_PLATFORM);
};
const getProxyHost = (port) => {
  return `${port}-${process.env.WEBIDE_PODID || ''}.webide-boe.byted.org`;
};
const isDevelopment = process.env.NODE_ENV !== 'production';

const getPublicPath = (appName: string) => {
  const port = portMap[appName].port;
  const publicPath = portMap[appName].publicPath;
  return !isDevelopment
    ? publicPath
    : isInWebIDE()
    ? `//${getProxyHost(port)}/`
    : `//localhost:${port}/`;
};

const getPort = (appName: string) => portMap[appName].port;
export { isInWebIDE, getProxyHost, isDevelopment, getPublicPath, getPort };
