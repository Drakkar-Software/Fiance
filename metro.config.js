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

if (!config.resolver.assetExts.includes('wasm')) config.resolver.assetExts.push('wasm')
// Allow resolving packages that only export under "import" or "default" conditions (e.g. ESM-only subpaths)
if (!config.resolver.unstable_conditionNames.includes('import')) config.resolver.unstable_conditionNames.push('import', 'default', 'require')
if (!config.resolver.sourceExts.includes('sql')) config.resolver.sourceExts.push('sql')

// Apply NativeWind, then override transformer so our SQL handler runs outermost
const finalConfig = withNativeWind(config, { input: "./global.css" });
finalConfig.transformer.babelTransformerPath = require.resolve('./metro-sql-transform.js');
module.exports = finalConfig;
