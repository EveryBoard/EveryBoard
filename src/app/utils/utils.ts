import { FieldValue } from '@angular/fire/firestore';
import { ErrorLoggerService } from '../services/ErrorLoggerService';

// These are the datatypes supported by firestore. Arrays of arrays are not
// supported, but arrays containing objects containing arrays are, which is what
// is encoded in these types.

export type JSONPrimitive = string | number | boolean | null | undefined;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObject
export type JSONObject = { [member: string]: JSONValue };

export function isJSONPrimitive(value: unknown): value is JSONPrimitive {
    if (typeof value === 'string') return true;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (value === null) return true;
    return false;
}

export type FirestoreJSONPrimitive = JSONPrimitive | FieldValue;
export type FirestoreJSONValue =
    FirestoreJSONPrimitive |
    FirestoreJSONObject |
    Array<FirestoreJSONValueWithoutArray> |
    ReadonlyArray<FirestoreJSONValueWithoutArray>;
export type FirestoreJSONValueWithoutArray = FirestoreJSONPrimitive | FirestoreJSONObject
export type FirestoreJSONObject = { [member: string]: FirestoreJSONValue };

export class Debug {
    /**
     * Enables logging for a class or method programmatically.
     * For example, call Debug.enableLog([true, false], 'YourClass', 'yourMethod') in app.component.ts
     */
    public static enableLog(entryExit: [boolean, boolean], className: string, methodName?: string): void {
        if (methodName) {
            window['verbosity'][className + '.' + methodName] = entryExit;
        } else {
            window['verbosity'][className] = entryExit;
        }
    }
    private static isVerbose(name: string): [boolean, boolean] {
        /* eslint-disable dot-notation */
        if (window['verbosity'] == null) return [false, false];
        if (window['verbosity'][name] == null) return [false, false];
        if (Array.isArray(window['verbosity'][name])) {
            // If it is an array, this means we want to specify input or output logging
            return window['verbosity'][name] as [boolean, boolean];
        } else {
            // If it is anything else (besides null/undefined), this means logging is fully enabled
            return [true, true];
        }
        /* eslint-enable dot-notation */
    }
    private static isMethodVerbose(className: string, methodName: string): [boolean, boolean] {
        return Debug.isVerbose(className) || Debug.isVerbose(className + '.' + methodName);
    }
    public static display(className: string, methodName: string, message: unknown): void {
        if (Debug.isMethodVerbose(className, methodName)) {
            console.log(message);
        }
    }
    /**
     * Class decorator that enables logging for all methods of a class
     * Note: we could think that T should be typed `T extends { new(...args: unknown[]): unknown }>`
     * but this would restrict the decorator to only be applied to classes with public constructors.
     */
    public static log<T>(constructor: T): void {
        const className: string = constructor['name'];
        for (const propertyName of Object.getOwnPropertyNames(constructor['prototype'])) {
            const descriptor: PropertyDescriptor =
                Utils.getNonNullable(Object.getOwnPropertyDescriptor(constructor['prototype'], propertyName));
            const isMethod: boolean = descriptor.value instanceof Function;
            if (isMethod === false) {
                continue;
            }

            const originalMethod: (...args: unknown[]) => unknown = descriptor.value;
            descriptor.value = function(...args: unknown[]): unknown {
                if (Debug.isMethodVerbose(className, propertyName)[0]) {
                    const strArgs: string = Array.from(args).map((arg: unknown): string =>
                        JSON.stringify(arg)).join(', ');
                    console.log(`> ${className}.${propertyName}(${strArgs})`);
                }
                const result: unknown = originalMethod.apply(this, args);
                if (Debug.isMethodVerbose(className, propertyName)[1]) {
                    console.log(`< ${className}.${propertyName} -> ${JSON.stringify(result)}`);
                }
                return result;
            };

            Object.defineProperty(constructor['prototype'], propertyName, descriptor);
        }
    }
}

export class Utils {

    public static expectToBe<T>(value: T, expected: T, message?: string): void {
        if (value !== expected) {
            if (message !== undefined) {
                throw new Error(message);
            }
            throw new Error(`A default switch case did not observe the correct value, expected ${expected}, but got ${value} instead.`);
        }
    }
    public static expectToBeMultiple<T>(value: T, expectedValues: T[]): void {
        let found: boolean = false;
        for (const expected of expectedValues) {
            if (value === expected) {
                found = true;
                break;
            }
        }
        if (found === false) {
            throw new Error(`A default switch case did not observe the correct value, expected a value among ${expectedValues}, but got ${value} instead.`);
        }
    }
    public static getNonNullable<T>(value : T | null | undefined): T {
        if (value == null) {
            throw new Error(`Expected value not to be null or undefined, but it was.`);
        } else {
            return value;
        }
    }
    public static assert(condition: boolean, message: string): void {
        if (condition === false) {
            // We log the error but we also throw an exception
            // This is because if an assertion fails,
            // we don't want to execute the code after the assertion.
            // Otherwise, this could result in potentially very serious issues.
            ErrorLoggerService.logError('Assertion failure', message);
            throw new Error(`Assertion failure: ${message}`);
        }
    }
    public static identity<T>(thing: T): T {
        return thing;
    }
}

export function display(cond: boolean, message: any): void {}
