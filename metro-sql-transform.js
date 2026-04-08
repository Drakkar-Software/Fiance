// Metro top-level transformer that intercepts .sql files and emits them
// as plain string modules, delegating all other files to the original chain.
//
// Must be set as config.transformerPath (not babelTransformerPath) AFTER
// withNativeWind, so we wrap the css-interop transformer it sets.
// The original transformerPath is stored in config.sql_originalTransformerPath.

module.exports.transform = async function (config, projectRoot, filename, data, options) {
  if (filename.endsWith(".sql")) {
    const src = data.toString("utf8");
    const code = "module.exports = " + JSON.stringify(src) + ";";
    return {
      dependencies: [],
      output: [
        {
          type: "js/module",
          data: {
            code,
            lineCount: 1,
            map: [],
            functionMap: null,
            hasCjsExports: true,
          },
        },
      ],
    };
  }
  return require(config.sql_originalTransformerPath).transform(
    config,
    projectRoot,
    filename,
    data,
    options
  );
};

module.exports.getCacheKey = function () {
  return "metro-sql-transform-v2";
};
