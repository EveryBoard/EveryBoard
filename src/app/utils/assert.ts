import { ErrorLoggerService } from '../services/ErrorLoggerService';

export function assert(condition: boolean, message: string): void {
    if (condition === false) {
        // We log the error but we also throw an exception
        // This is because if an assertion fails,
        // we don't want to execute the code after the assertion.
        // Otherwise, this could result in potentially very serious issues.
        ErrorLoggerService.logError('Assertion failure', message);
        throw new Error(`Assertion failure: ${message}`);
    }
}
