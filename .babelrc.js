module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        loose: true,
        modules: false
      }
    ],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript"
  ],
  plugins: [
    process.env.NODE_ENV === "production" && "transform-react-remove-prop-types"
  ].filter(Boolean),
  // Increase code generator limits for large files
  generatorOpts: {
    retainLines: false,
    compact: true,
    minified: true,
    // Increase size limit for files
    jsescOption: {
      minimal: true
    }
  },
  // Don't check for file existence - improves performance
  assumptions: {
    privateFieldsAsProperties: true,
    setPublicClassFields: true,
    noDocumentAll: true
  },
  // Optimize for speed
  compact: true,
  comments: false,
  // Ensure we're not using helper imports that could increase bundle size
  helpers: false
};
