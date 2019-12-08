const path = require('path')
const alias = require('@rollup/plugin-alias')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const typescript = require('rollup-plugin-typescript')
const react = require('react')

module.exports = function(config) {
  const chromeFlags = [
    // '--autoplay-policy=no-user-gesture-required',
    '--disable-gpu',
    '--disable-web-security',
    '--deterministic-fetch',
    '--disable-site-isolation-trials',
    '--lang=en_US',
    '--no-sandbox',
  ]

  const firefoxFlags = {
    'media.autoplay.enabled': true,
    'media.block-autoplay-until-in-foreground': false,
    'security.fileuri.strict_origin_policy': false,
  }
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    frameworks: ['parallel', 'jasmine'],

    client: {
      jasmine: {
        timeoutInterval: 15000,
      },
    },

    files: [
      /**
       * Make sure to disable Karma’s file watcher
       * because the rollup preprocessor will use its own.
       */
      { pattern: 'src/**/*.browser.test.ts', watched: false },
      { pattern: 'src/**/*.browser.test.tsx', watched: false },
    ],

    preprocessors: {
      'src/**/*.ts*': ['rollup'],
    },

    rollupPreprocessor: {
      treeshake: false,
      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'reactUniversalPlayer', // Required for 'iife' format.
        sourcemap: 'inline',
      },
      plugins: [
        alias({
          entries: {
            'react-dom/server': path.resolve('./node_modules/react-dom/server.browser.js'),
            '@sheerun/mutationobserver-shim': path.resolve(
              './node_modules/@sheerun/mutationobserver-shim/MutationObserver.js'
            ),
          },
        }),

        nodeResolve({
          mainFields: ['module', 'main'],
        }),

        commonjs({
          namedExports: {
            react: Object.keys(react),
            'react-dom/test-utils': ['act'],
            'react-dom/server.browser': ['renderToString'],
          },
        }),

        typescript({
          declaration: false,
          declarationMap: false,
          target: 'es2019',
        }),

        replace({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env': JSON.stringify({}),
        }),
      ],
    },

    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    browsers: ['CustomChrome'],

    customLaunchers: {
      CustomChrome: {
        base: 'Chrome',
        flags: chromeFlags,
      },
      CustomHeadlessChrome: {
        base: 'ChromeHeadless',
        flags: chromeFlags,
      },
      CustomFF: {
        base: 'Firefox',
        prefs: firefoxFlags,
      },
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    parallelOptions: {
      executors: process.env.CI ? 2 : 1,
    },
  })
}
