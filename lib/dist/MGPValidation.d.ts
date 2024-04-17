import { MGPFallible } from './MGPFallible';
export type MGPValidation = MGPFallible<void>;
export declare namespace MGPValidation {
    const SUCCESS: MGPValidation;
    function ofFallible<T>(fallible: MGPFallible<T>): MGPValidation;
    function failure(reason: string): MGPValidation;
}
/**
 * This is a helper class to test MGPValidation values
 */
export declare class MGPValidationTestUtils {
    static expectToBeSuccess(fallible: MGPValidation, context?: string): void;
    static expectToBeFailure(fallible: MGPValidation, reason: string): void;
}
