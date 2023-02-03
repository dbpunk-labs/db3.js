export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
    },
    testPathIgnorePatterns: ["/node_modules/", "/thirdparty/", "/src/"],
    testMatch: ["tests/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"]
}
