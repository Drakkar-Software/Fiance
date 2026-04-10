// Strip @layer properties from Tailwind v4 compiled output.
// That block wraps CSS custom property defaults in an @supports condition containing
// `rgb(from red r g b)` (CSS relative color syntax), which lightningcss 1.32.0's
// NAPI binding cannot deserialize when react-native-css processes the CSS for
// native (Android/iOS) Metro bundles. The block is a browser-only fallback for
// engines without @property support — irrelevant for native, safe to drop for web.
/** @type {import('postcss').Plugin} */
const stripLayerProperties = {
  postcssPlugin: 'strip-layer-properties',
  AtRule: {
    layer(rule) {
      if (rule.params === 'properties') {
        rule.remove();
      }
    },
  },
};

module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    stripLayerProperties,
  ],
};
