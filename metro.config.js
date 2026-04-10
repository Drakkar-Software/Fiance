const path = require('node:path')
const fs = require('node:fs')
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

if (!config.resolver.unstable_conditionNames.includes('import')) config.resolver.unstable_conditionNames.push('import', 'default', 'require')
if (!config.resolver.sourceExts.includes('sql')) config.resolver.sourceExts.push('sql')

// Force CJS @babel/runtime helpers: the ESM versions export via .default which breaks
// pre-compiled packages (e.g. expo-router) that call require(helper)(...) directly.
const babelRuntimeDir = path.dirname(require.resolve('@babel/runtime/package.json'))
const seahorseRoot = path.resolve(projectRoot, 'node_modules/@drakkar.software/seahorse')
const reactRuntimeDir = path.dirname(require.resolve('react/package.json'))
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@babel/runtime/helpers/') && !moduleName.includes('/esm/')) {
    const helperFile = path.join(babelRuntimeDir, moduleName.replace('@babel/runtime/', '') + '.js')
    return { type: 'sourceFile', filePath: helperFile }
  }
  // NativeWind v5 no longer ships a jsx-runtime (class transforms happen at compile time).
  // Pre-compiled files built with jsxImportSource:"nativewind" still import it, so redirect
  // to React's standard jsx-runtime which is the correct no-op equivalent.
  if (moduleName === 'nativewind/jsx-runtime' || moduleName === 'nativewind/jsx-dev-runtime') {
    const runtimeFile = moduleName.replace('nativewind/', '')
    return { type: 'sourceFile', filePath: path.join(reactRuntimeDir, runtimeFile + '.js') }
  }
  // Break the react-native-css circular dependency on web.
  // The babel import-plugin rewrites `require("react-native")` to
  // `require("react-native-css/components")` in all files. Inside pnpm, the plugin's
  // __dirname-based `isFromThisModule` check fails due to symlink path mismatch, so it
  // also rewrites react-native imports inside react-native-css's own files (e.g. web/api.js).
  // This creates: react-native-css/components → react-native-css → web/api.js →
  //   react-native → react-native-css/components (cycle → TDZ crash).
  // @legendapp/list also does require('react-native') which gets rewritten the same way,
  // causing a TDZ crash when FlashList (from seahorse/primitives) is used on web.
  // Fix: redirect react-native-css/components requests from these packages to react-native-web.
  if (
    platform === 'web' &&
    (moduleName === 'react-native-css/components' || moduleName === 'react-native-css') &&
    (context.originModulePath.includes('react-native-css') || context.originModulePath.includes('@legendapp/'))
  ) {
    return context.resolveRequest(context, 'react-native-web', platform)
  }
  // Metro doesn't apply platform extensions inside node_modules subpath exports.
  // Redirect seahorse modules that have .web.js variants when bundling for web.
  if (platform === 'web' && moduleName.startsWith('@drakkar.software/seahorse/utils/')) {
    const subpath = moduleName.replace('@drakkar.software/seahorse/utils/', '')
    const webFile = path.join(seahorseRoot, 'dist/utils', subpath + '.web.js')
    if (fs.existsSync(webFile)) {
      return { type: 'sourceFile', filePath: webFile }
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

// globalClassNamePolyfill: false — avoids react-native-css/components circular
// dependency on web (FlatList.js imports react-native-css which imports back
// into components). The nativewind/babel import-plugin handles className→style
// transforms at compile time instead, which doesn't trigger the cycle.
module.exports = withNativeWind(config, { input: "./global.css", globalClassNamePolyfill: false });
