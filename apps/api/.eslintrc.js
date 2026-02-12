const baseConfig = require('@anandibi/config/.eslintrc.base.js');

module.exports = {
    ...baseConfig,
    parserOptions: {
        ...baseConfig.parserOptions,
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
    },
};
