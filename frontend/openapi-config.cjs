// openapi-config.cjs
/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  schemaFile: "https://aumonext-api.onrender.com/openapi/v1.json",
  apiFile: "./src/lib/apiClient.ts",
  apiImport: "baseApi",
  outputFile: "./src/lib/generatedApi.ts",
  exportName: "generatedApi",
  hooks: true,
};

module.exports = config;