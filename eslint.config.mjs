import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        node: true,
        process: true,
        __dirname: true,
        require: true,
        module: true,
        console: true,
        setTimeout: true,
        setInterval: true,
        path: true,
        fs: true
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      "import/no-unresolved": "error",
      "no-duplicate-imports": "error",
      "import/no-duplicates": "error",
      "import/no-self-import": "error",
      "no-unused-vars": "warn",
      "no-console": "off"
    },
    settings: {
      "import/resolver": {
        "node": {
          "extensions": [".js", ".json"]
        }
      }
    }
  }
];
