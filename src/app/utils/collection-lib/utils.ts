export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValue>;
export type JSONObject = { [member: string]: JSONValue };

export function display(verbose: boolean, message: unknown): void {
    if (verbose) console.log(message);
}

export function assert(condition: boolean, message: string): void {
    if (condition === false) {
        throw new Error('Assertion failure: ' + message);
    }
}
