import { comparableEquals, comparableEqualsIfComparable, ComparableJSON, ComparableObject } from '../Comparable';

class DummyComparableObject implements ComparableObject {
    public constructor(readonly value: number) {}
    public equals(o: DummyComparableObject): boolean {
        return this.value === o.value;
    }
    public toString(): string {
        return 'dummy';
    }
}

class DummyNonComparableObject {
    public constructor(readonly value: number) {}
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
            expect(comparableEquals(new DummyComparableObject(5), new DummyComparableObject(5))).toBeTrue();
            expect(comparableEquals(new DummyComparableObject(5), new DummyComparableObject(6))).toBeFalse();
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
    describe('comparableEqualsIfComparable', () => {
        it('should succeed if both objects with comparable types', () => {
            expect(comparableEqualsIfComparable(5, 5)).toBeTrue();
            expect(comparableEqualsIfComparable(5, 6)).toBeFalse();
        });
        it('should throw if objects are not comparable', () => {
            expect(() => comparableEqualsIfComparable(new DummyNonComparableObject(5), new DummyNonComparableObject(5))).toThrowError('foo');
        });
    });
});
