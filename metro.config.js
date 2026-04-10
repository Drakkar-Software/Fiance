const path = require('node:path')
const { withNativeWind } = require('nativewind/metro')
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname
const workspaceRoot = projectRoot
const config = getDefaultConfig(projectRoot)

config.resolver.unstable_enableSymlinks = true
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// Prefer CJS over ESM to avoid import.meta issues (zustand ESM uses import.meta.env)
if (!config.resolver.unstable_conditionNames.includes('require'))
  config.resolver.unstable_conditionNames.unshift('require')

if (!config.resolver.sourceExts.includes('sql')) config.resolver.sourceExts.push('sql')

const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = originalResolveRequest ?? context.resolveRequest

  // NW v5 preview dropped jsx-runtime shims; expo-router still imports them.
  if (moduleName === 'nativewind/jsx-runtime')
    return resolve(context, 'react/jsx-runtime', platform)
  if (moduleName === 'nativewind/jsx-dev-runtime')
    return resolve(context, 'react/jsx-dev-runtime', platform)

  // react-native-css/components uses cssInterop which fails on web.
  // On web NativeWind handles className via real CSS — bypass cssInterop.
  if (platform === 'web' && moduleName === 'react-native-css/components')
    return resolve(context, 'react-native', platform)

  // Fix @babel/runtime ESM crash on web.
  if (platform === 'web' && moduleName.startsWith('@babel/runtime/helpers/esm/'))
    return resolve(context, moduleName.replace('@babel/runtime/helpers/esm/', '@babel/runtime/helpers/'), platform)

  return resolve(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
