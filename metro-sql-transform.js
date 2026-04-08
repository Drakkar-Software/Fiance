const upstreamTransformer = require("@expo/metro-config/build/babel-transformer");

module.exports.transform = async function ({ src, filename, options }) {
  if (filename.endsWith(".sql")) {
    return { code: `module.exports = ${JSON.stringify(src)};`, map: null };
  }
  return upstreamTransformer.transform({ src, filename, options });
};
