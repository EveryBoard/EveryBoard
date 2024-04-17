import { JSONValue } from './JSON';
import { MGPValidation } from './MGPValidation';
export declare class Utils {
    /**
     * The error logger is called in order to log errors when they arise.
     * It should be set by the codebase relying on this, for example by doing:
     * Utils.logError = myErrorLogger;
     */
    static logError: (kind: string, message: string, data?: JSONValue) => MGPValidation;
    static expectToBe<T>(value: T, expected: T, message?: string): void;
    static expectToBeMultiple<T>(value: T, expectedValues: T[]): void;
    static getNonNullable<T>(value: T | null | undefined): T;
    static assert(condition: boolean, message: string, data?: JSONValue): void;
    static identity<T>(thing: T): T;
}
