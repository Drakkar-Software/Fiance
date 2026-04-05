const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = [
  "react-native",
  "browser",
  "require",
];

config.resolver.assetExts = [...(config.resolver.assetExts || []), "wasm"];

module.exports = withNativeWind(config, { input: "./global.css" });
