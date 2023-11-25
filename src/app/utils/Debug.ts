import { Utils } from './Utils';

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
            Utils.assert(Array.isArray(verbosity[name]), `malformed verbosity levels for ${name}: ${verbosity[name]}`);
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

// To make Debug.enableLog accessible in the console, run this somewhere in the app's initialization code:
// window['enableLog'] = Debug.enableLog;
// To use it, one just has to do window.enableLog([true, true], 'SomeClass, 'someMethod')
