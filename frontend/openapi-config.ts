import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
  schemaFile: "https://aumoweb.onrender.com/openapi/v1.json",
  apiFile: "./src/lib/apiClient.ts",
  apiImport: "baseApi",
  outputFile: "./src/lib/generatedApi.ts",
  exportName: "generatedApi",
  hooks: true,
};

export default config;
