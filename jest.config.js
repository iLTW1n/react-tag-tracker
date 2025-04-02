module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest"
  },
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"]
};