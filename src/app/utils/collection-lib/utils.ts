export function display(verbose: boolean, message: unknown): void {
    if (verbose) console.log(message);
}

export function assert(condition: boolean, message: string): void {
    if (condition === false) {
        throw new Error('Assertion failure: ' + message);
    }
}
