import globals from "globals";
import pluginJs from "@eslint/js";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";
export default [
  {
    files: ["**/*.ts"], // Target TypeScript files
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        project: "./tsconfig.json", // Point to your tsconfig.json
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node, // Include Node.js globals
      },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules, // Include recommended JavaScript rules
      ...tsEslintPlugin.configs.recommended.rules, // Include recommended TypeScript rules
      // Add your custom rules here, e.g.:
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];