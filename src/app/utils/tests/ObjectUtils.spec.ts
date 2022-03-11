/* eslint-disable max-lines-per-function */
import { ObjectDifference } from '../ObjectUtils';
import { FirebaseJSONObject, FirebaseJSONValue } from '../utils';

describe('ObjectDifference', () => {

    it('Should detect differences in a modified object', () => {
        const before: FirebaseJSONObject = {
            same: 5,
            changed: {
                insideChange: 12,
            },
        };
        const after: FirebaseJSONObject = {
            same: 5,
            changed: {
                insideChange: 0,
            },
        };
        const modified: Record<string, unknown> = {
            changed: new ObjectDifference({}, { insideChange: 0 }, {}),
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, modified, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('Should compare json inside a list deeply', () => {
        const before: FirebaseJSONObject = {
            liste: [
                {
                    monTruc: {
                        maCoord: { x: 0, y: 2 },
                        placement: 'EH OUI MON GARS',
                    },
                    leChat: 'est bleu',
                    letPet: [],
                }],
        };
        const after: FirebaseJSONObject = {
            liste: [
                {
                    monTruc: {
                        maCoord: { x: 0, y: 2 },
                        placement: 'EH OUI MON GARS',
                    },
                    leChat: 'est bleu',
                    letPet: [],
                }],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle null objects', () => {
        const before: FirebaseJSONValue = null;
        const after: FirebaseJSONObject = {
            someKey: 1,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: 1 }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle null values', () => {
        const before: FirebaseJSONObject = {
            someKey: null,
        };
        const after: FirebaseJSONObject = {
            someKey: null,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null value being set', () => {
        const before: FirebaseJSONObject = {
            someKey: null,
        };
        const after: FirebaseJSONObject = {
            someKey: true,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: true }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle an undefined value being set', () => {
        const before: FirebaseJSONObject = {
            someKey: undefined,
        };
        const after: FirebaseJSONObject = {
            someKey: true,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: true }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null object', () => {
        const before: FirebaseJSONObject = {
            someKey: 42,
        };
        const after: FirebaseJSONObject | null = null;
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 42 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle addition of new keys', () => {
        const before: FirebaseJSONObject = {
            someKey: 1,
        };
        const after: FirebaseJSONObject = {
            someKey: 1,
            someOtherKey: 2,
            // Null is not considered an addition
            someNullKey: null,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someOtherKey: 2 }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should consider changing null to something as adding a key', () => {
        const before: FirebaseJSONObject = {
            someKey: null,
        };
        const after: FirebaseJSONObject = {
            someKey: 1,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: 1 }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle removal of keys', () => {
        const before: FirebaseJSONObject = {
            someKey: 1,
        };
        const after: FirebaseJSONObject = { };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 1 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle setting to null as removal', () => {
        const before: FirebaseJSONObject = {
            someKey: 1,
        };
        const after: FirebaseJSONObject = {
            someKey: null,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 1 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list of objects', () => {
        const before: FirebaseJSONObject = {
            someKey: [{ num: 1 }],
        };
        const after: FirebaseJSONObject = {
            someKey: [{ num: 4 }],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [{ num: 4 }] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle an identical list', () => {
        const before: FirebaseJSONObject = {
            someKey: [1],
        };
        const after: FirebaseJSONObject = {
            someKey: [1],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list', () => {
        const before: FirebaseJSONObject = {
            someKey: [1],
        };
        const after: FirebaseJSONObject = {
            someKey: [2],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [2] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list length', () => {
        const before: FirebaseJSONObject = {
            someKey: [1],
        };
        const after: FirebaseJSONObject = {
            someKey: [1, 2],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [1, 2] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should fail when a list becomes another type', () => {
        const before: FirebaseJSONObject = {
            someKey: [],
        };
        const after: FirebaseJSONObject = {
            someKey: 0,
        };
        expect(() => ObjectDifference.from(before, after)).toThrowError('Thing should not change type');
    });
});
