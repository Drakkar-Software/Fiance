const path = require('node:path')
const { withNativeWind } = require('nativewind/metro')
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const config = getDefaultConfig(projectRoot)

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

  // hash-wasm (Argon2id in starfish-identities) requires a WebAssembly global —
  // absent on Hermes ("WebAssembly is not supported in this environment"). On native
  // (iOS/Android) redirect to a shim that delegates to react-native-quick-crypto's
  // native Argon2id binding (OpenSSL, ~150 ms vs ~15–45 s pure JS). On web keep the
  // original @noble/hashes shim. A package exports map can't remap a third-party
  // specifier imported deep inside a dependency, so the alias must live here.
  if (moduleName === 'hash-wasm') {
    const isNative = platform === 'ios' || platform === 'android'
    const shimFile = isNative ? 'lib/hash-wasm-shim.native.ts' : 'lib/hash-wasm-shim.ts'
    return { type: 'sourceFile', filePath: path.resolve(projectRoot, shimFile) }
  }

  // Workspace SDK packages (packages/*) use NodeNext-style .js extensions in
  // source imports for ESM/tsup compatibility. Metro resolves directly from TS
  // source so it can't find .js files — strip the extension to resolve to .ts.
  if (moduleName.endsWith('.js') && context.originModulePath.startsWith(workspacePackagesRoot))
    return resolve(context, moduleName.slice(0, -3), platform)

  return resolve(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
