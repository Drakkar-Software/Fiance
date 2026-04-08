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

module.exports = withNativeWind(config, { input: "./global.css" });
