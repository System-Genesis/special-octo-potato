module.exports = {
    preset: 'ts-jest',

    testEnvironment: 'node',
    // setupFiles: ['<rootDir>/src/tests/setup/setup.ts'],
    collectCoverage: false,
    testMatch: ['<rootDir>/src/tests/**/*.*.test.(ts)'],
    transform: {
        '.(ts|tsx)': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            compiler: 'ttypescript',
        },
    },
};
