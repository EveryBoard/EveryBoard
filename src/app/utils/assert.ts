import { ErrorLoggerService } from '../services/ErrorLoggerService';

// @deprecated Prefer to use Utils.assert instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: boolean, message: string, notStringMessage?: any): void {
    if (condition === false) {
        // We log the error but we also throw an exception
        // This is because if an assertion fails,
        // we don't want to execute the code after the assertion.
        // Otherwise, this could result in potentially very serious issues.
        if (notStringMessage !== undefined) {
            console.log(notStringMessage);
        }
        ErrorLoggerService.logError('Assertion failure', message);
        throw new Error(`Assertion failure: ${message}`);
    }
}
