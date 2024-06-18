// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-time-stats-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
            jasmine: {
                timeoutInterval: 10000,
            }
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html', subdir: '.' },
                { type: 'text-summary' },
            ],
            check: {
                global: {
                    statements: 99.78,
                    branches: 99.37, // always keep it 0.02% below local coverage
                    functions: 99.77,
                    lines: 99.78,
                },
            },
        },
        timeStatsReporter: {
            reportTimeStats: true,
            binSize: 100, // in ms
            slowThreshold: 500,
            reportSlowestTests: true,
            longestTestsCount: Infinity,
            reportOnlyBeyondThreshold: true,
        },
        customLaunchers: {
            ChromeHeadlessCustom: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu'],
                browserNoActivityTimeout: 20000,
                browserDisconnectTimeout: 20000,
                pingTimeout: 20000
            },
        },

        reporters: ['progress', 'coverage', 'kjhtml', 'time-stats'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        browserNoActivityTimeout: 60000, // Timeout set to a high value because some tests need more time than the default 2s
        browserDisconnectTimeout: 60000,
        pingTimeout: 60000
    });
};
