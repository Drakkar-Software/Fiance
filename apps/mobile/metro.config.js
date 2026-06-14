const path = require('node:path')
const { withNativeWind } = require('nativewind/metro')
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const config = getSentryExpoConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.unstable_enableSymlinks = true
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Prefer CJS over ESM to avoid import.meta issues (zustand ESM uses import.meta.env)
if (!config.resolver.unstable_conditionNames.includes('require'))
  config.resolver.unstable_conditionNames.unshift('require')

const workspacePackagesRoot = path.resolve(workspaceRoot, 'packages')
const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = originalResolveRequest ?? context.resolveRequest

  // NW v5 preview dropped jsx-runtime shims; expo-router still imports them.
  if (moduleName === 'nativewind/jsx-runtime')
    return resolve(context, 'react/jsx-runtime', platform)
  if (moduleName === 'nativewind/jsx-dev-runtime')
    return resolve(context, 'react/jsx-dev-runtime', platform)

  // react-native-css/components uses cssInterop which fails on web.
  if (platform === 'web' && moduleName === 'react-native-css/components')
    return resolve(context, 'react-native', platform)

  // Fix @babel/runtime ESM crash on web.
  if (platform === 'web' && moduleName.startsWith('@babel/runtime/helpers/esm/'))
    return resolve(context, moduleName.replace('@babel/runtime/helpers/esm/', '@babel/runtime/helpers/'), platform)

  // Workspace SDK packages (packages/*) use NodeNext-style .js extensions in
  // source imports for ESM/tsup compatibility. Metro resolves directly from TS
  // source so it can't find .js files — strip the extension to resolve to .ts.
  if (moduleName.endsWith('.js') && context.originModulePath.startsWith(workspacePackagesRoot))
    return resolve(context, moduleName.slice(0, -3), platform)

  return resolve(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
