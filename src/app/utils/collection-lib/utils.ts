export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | Array<JSONValueWithoutArray>;
export type JSONValueWithoutArray = JSONPrimitive | JSONObjectWithoutArray;
export type JSONObject = { [member: string]: JSONValue };
export type JSONObjectWithoutArray = { [member: string]: JSONValueWithoutArray };

export function display(verbose: boolean, message: unknown): void {
    if (verbose) console.log(message);
}

export function assert(condition: boolean, message: string): void {
    if (condition === false) {
        throw new Error('Assertion failure: ' + message);
    }
}
