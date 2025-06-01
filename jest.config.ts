export default {
  rootDir: "./",
  moduleDirectories: ["node_modules"],
  testTimeout: 600000,
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testMatch: ["**/tests/unit/*.test.ts", "**/tests/integration/*.spec.ts"],
};
