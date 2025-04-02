export default {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
};