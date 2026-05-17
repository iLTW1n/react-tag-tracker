import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

const sourceFiles = ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.ts", "**/*.jsx", "**/*.tsx"];

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  { files: sourceFiles },
  { files: sourceFiles, languageOptions: { globals: globals.browser } },
  { files: sourceFiles, plugins: { js }, extends: ["js/recommended"] },
  { files: sourceFiles, settings: { react: { version: "detect" } } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
]);
