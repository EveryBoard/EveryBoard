import { comparableEquals, comparableEqualsIfComparable, ComparableJSON, ComparableObject, isComparableJSON, isComparableObject, isComparableValue } from '../Comparable';
import { Utils } from '../utils';

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
    public someMethod(): void {}
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
    describe('isComparableObject', () => {
        it('should return true for objects that define an equals method only', () => {
            expect(isComparableObject(new DummyComparableObject(5))).toBeTrue();
            expect(isComparableObject(new DummyNonComparableObject(5))).toBeFalse();
        });
    });
    describe('isComparableJSON', () => {
        it('should return true for comparable JSON only', () => {
            expect(isComparableJSON({ 'foo': 5 })).toBeTrue();
            expect(isComparableJSON(new DummyNonComparableObject(5))).toBeFalse();
            expect(isComparableJSON({ 'foo': new DummyNonComparableObject(5) })).toBeFalse();
            expect(isComparableJSON({ 1: 'foo' })).toBeTrue();
        });
    });
    describe('isComparableValue', () => {
        it('should return true for all types comparable values', () => {
            expect(isComparableValue(new DummyComparableObject(5))).toBeTrue();
            expect(isComparableValue(new DummyNonComparableObject(5))).toBeFalse();
            expect(isComparableValue(5)).toBeTrue();
            expect(isComparableValue(undefined)).toBeFalse();
            expect(isComparableValue({ 'foo': { 'bar': { 'baz': 5 } } })).toBeTrue();
            expect(isComparableValue({ 'foo': { 'bar': { 'baz': new DummyNonComparableObject(5) } } })).toBeFalse();
        });
    });
    describe('comparableEqualsIfComparable', () => {
        it('should succeed if both objects with comparable types', () => {
            expect(comparableEqualsIfComparable(5, 5)).toBeTrue();
            expect(comparableEqualsIfComparable(5, 6)).toBeFalse();
        });
        it('should fail if objects are not comparable', () => {
            spyOn(Utils, 'handleError').and.returnValue(null);
            comparableEqualsIfComparable(new DummyNonComparableObject(5), new DummyNonComparableObject(5));
            expect(Utils.handleError).toHaveBeenCalledWith('Comparing non comparable objects');
        });
    });
});
