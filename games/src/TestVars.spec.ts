export namespace TestVars {
    export const slowTests: boolean =
        process.env['EVERYBOARD_RUN_SLOW_TESTS'] === 'true';
}
