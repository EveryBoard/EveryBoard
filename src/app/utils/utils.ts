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
     * For example, call `Debug.enableLog([true, false], 'YourClass', 'yourMethod')` in app.component.ts
     * `entryExit` is composed of two booleans: the first states if we want to log entry to a method,
     * the second if we want to log exit
     */
    public static enableLog(entryExit: [boolean, boolean], className: string, methodName?: string): void {
        // We can't store objects in localStorage, only strings. So we serialize everything to JSON.
        const verbosityJSON: string | null = localStorage.getItem('verbosity');
        let verbosity: object = {};
        if (verbosityJSON != null) {
            verbosity = JSON.parse(verbosityJSON);
        }
        if (methodName) {
            verbosity[className + '.' + methodName] = entryExit;
        } else {
            verbosity[className] = entryExit;
        }
        localStorage.setItem('verbosity', JSON.stringify(verbosity));
    }
    private static isVerbose(name: string): [boolean, boolean] {
        const verbosityJSON: string | null = localStorage.getItem('verbosity');
        if (verbosityJSON == null) return [false, false];
        try {
            const verbosity: object = JSON.parse(verbosityJSON);
            if (verbosity[name] == null) return [false, false];
            Utils.assert(Array.isArray(verbosity[name]), `malformed verbosity levels: ${verbosity[name]}`);
            return verbosity[name] as [boolean, boolean];
        } catch (e) {
            // Verbosity is not proper JSON
            throw new Error(`malformed verbosity object: ${verbosityJSON}`);
        }
    }
    private static isMethodVerboseEntry(className: string, methodName: string): boolean {
        return Debug.isVerbose(className)[0] || Debug.isVerbose(className + '.' + methodName)[0];
    }
    private static isMethodVerboseExit(className: string, methodName: string): boolean {
        return Debug.isVerbose(className)[1] || Debug.isVerbose(className + '.' + methodName)[1];
    }
    public static display(className: string, methodName: string, message: unknown): void {
        if (Debug.isMethodVerboseEntry(className, methodName)) {
            console.log(`${className}.${methodName}: ${message}`);
        }
    }
    /**
     * Class decorator that enables logging for all methods of a class
     * Note: we could think that T should be typed `T extends { new(...args: unknown[]): unknown }`
     * but this would restrict the decorator to only be applied to classes with public constructors.
     */
    public static log<T>(constructor: T): void {
        const className: string = constructor['name'];
        for (const propertyName of Object.getOwnPropertyNames(constructor['prototype'])) {
            const nullableDescriptor: PropertyDescriptor | undefined = Object.getOwnPropertyDescriptor(
                constructor['prototype'],
                propertyName);
            const descriptor: PropertyDescriptor = Utils.getNonNullable(nullableDescriptor);
            const isMethod: boolean = descriptor.value instanceof Function;
            // In case the following assert ever gets violated, we can simply ignore the cases that are not method
            Utils.assert(isMethod, 'cannot add logging to properties that are not methods!');

            const originalMethod: (...args: unknown[]) => unknown = descriptor.value;
            descriptor.value = function(...args: unknown[]): unknown {
                if (Debug.isMethodVerboseEntry(className, propertyName)) {
                    const strArgs: string = Array.from(args).map((arg: unknown): string =>
                        JSON.stringify(arg)).join(', ');
                    console.log(`> ${className}.${propertyName}(${strArgs})`);
                }
                const result: unknown = originalMethod.apply(this, args);
                if (Debug.isMethodVerboseExit(className, propertyName)) {
                    console.log(`< ${className}.${propertyName} -> ${JSON.stringify(result)}`);
                }
                return result;
            };

            Object.defineProperty(constructor['prototype'], propertyName, descriptor);
        }
    }
}

// This makes Debug.enableLog accessible in the console
// To use it, one just has to do window.enableLog([true, true], 'SomeClass, 'someMethod')
window['enableLog'] = Debug.enableLog;

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
