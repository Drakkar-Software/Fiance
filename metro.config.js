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
const seahorseRoot = path.dirname(require.resolve('@drakkar.software/seahorse/package.json'))
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@babel/runtime/helpers/') && !moduleName.includes('/esm/')) {
    const helperFile = path.join(babelRuntimeDir, moduleName.replace('@babel/runtime/', '') + '.js')
    return { type: 'sourceFile', filePath: helperFile }
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

module.exports = withNativeWind(config, { input: "./global.css" });
