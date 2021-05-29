import { comparableEquals, ComparableJSON, ComparableObject } from '../Comparable';

class DummyObject implements ComparableObject {
    public constructor(readonly value: number) {}
    public equals(o: DummyObject): boolean {
        return this.value === o.value;
    }
    public toString(): string {
        return 'dummy';
    }
}

describe('Comparable', () => {
    describe('comparableEquals', () => {
        it('should support primitive values', () => {
            expect(comparableEquals(5, 5)).toBeTrue();
            expect(comparableEquals(5, 6)).toBeFalse();
            expect(comparableEquals('foo', 'foo')).toBeTrue();
            expect(comparableEquals('foo', 'bar')).toBeFalse();
            expect(comparableEquals(true, true)).toBeTrue();
            expect(comparableEquals(true, false)).toBeFalse();
            expect(comparableEquals(true, null)).toBeFalse();
        });
        it('should support objects that have an equal method', () => {
            expect(comparableEquals(new DummyObject(5), new DummyObject(5))).toBeTrue();
            expect(comparableEquals(new DummyObject(5), new DummyObject(6))).toBeFalse();
        });
        it('should support primitive JSON values', () => {
            const object1: ComparableJSON = { 'foo': 1 };
            object1[2] = 3;
            const object2: ComparableJSON = { 'foo': 1 };
            object2[2] = 4;
            const object3: ComparableJSON = { 'foo': 1 };
            expect(comparableEquals(object1, object1)).toBeTrue();
            expect(comparableEquals(object1, object2)).toBeFalse();
            expect(comparableEquals(object1, object3)).toBeFalse();
        });
    });
});
