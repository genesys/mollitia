module.exports = {
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testEnvironment: "node",
  testRegex: "/test/.*\\.spec\\.ts$",
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules",
    "/test"
  ],
  forceExit: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ]
};
