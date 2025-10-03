import { isJSONPrimitive, JSONParser, JSONValue } from '../JSON';
import { MGPOptional } from '../MGPOptional';

describe('isJSONPrimitive', () => {
    it('should return true for all types of JSON primitives', () => {
        expect(isJSONPrimitive('foo')).toBeTrue();
        expect(isJSONPrimitive(42)).toBeTrue();
        expect(isJSONPrimitive(true)).toBeTrue();
        expect(isJSONPrimitive(null)).toBeTrue();
    });
    it('should return false for non-JSON primitives', () => {
        expect(isJSONPrimitive([1, 2, 3])).toBeFalse();
        expect(isJSONPrimitive({})).toBeFalse();
        expect(isJSONPrimitive(undefined)).toBeFalse(); // undefined is not valid in JSON!
    });

});


describe('JSONParser', () => {
    function assertSuccess(json: JSONValue): void {
        const result: MGPOptional<JSONValue> = JSONParser.parseJSONSafely(JSON.stringify(json));
        expect(result.isPresent()).toBeTrue();
        expect(result.get()).toEqual(json);
    }

    it('should parse JSON primitives', () => {
        assertSuccess('hello');
        assertSuccess(42);
        assertSuccess(-37);
        assertSuccess(true);
        assertSuccess(false);
        assertSuccess(null);
    });

    it('should parse JSON flat arrays', () => {
        assertSuccess([1, 2, 3]);
    });

    it('should parse JSON objects', () => {
        assertSuccess({ foo: 42, bar: 'hello' });
        assertSuccess({ foo: 42, bar: 'hello' });
    });

    it('should parse nested objects and arrays', () => {
        assertSuccess([1, { 0: 1, 2: 3 }, 2, 3]);
        assertSuccess({ foo: [42, { hello: 37 }], bar: { baz: 'hello' } });
    });

    it('should fail with nested arrays', () => {
        const json: unknown = [[1], [2]];
        const result: MGPOptional<JSONValue> = JSONParser.parseJSONSafely(JSON.stringify(json));
        expect(result.isAbsent()).toBeTrue();
    });

    it('should fail on invalid JSON', () => {
        const invalidJSONString: string = '{"foo": lol}';
        const result: MGPOptional<unknown> = JSONParser.parseJSONSafely(invalidJSONString);
        expect(result.isAbsent()).toBeTrue();
    });
});
