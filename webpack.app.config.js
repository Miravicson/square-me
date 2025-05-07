const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

module.exports = {
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
      transformers: [
        {
          name: '@nestjs/swagger/plugin',
          options: {
            classValidatorShim: true,
            introspectComments: true,
          },
        },
      ],
    }),
  ],
};
