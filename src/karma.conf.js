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
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html', subdir: '.' },
                { type: 'text-summary' },
            ],
            check: {
                global: {
                    statements: 98.53,
                    branches: 96.60, // always keep it 0.02% below local coverage
                    functions: 98.52,
                    lines: 98.55,
                },
            },
        },
        customLaunchers: {
            ChromeHeadlessCustom: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu'],
            },
        },
        reporters: ['progress', 'coverage', 'kjhtml'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
    });
};
