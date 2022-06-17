/* eslint-disable max-lines-per-function */
import { ObjectDifference } from '../ObjectUtils';
import { FirestoreJSONObject, FirestoreJSONValue } from '../utils';

describe('ObjectDifference', () => {

    it('Should detect differences in a modified object', () => {
        const before: FirestoreJSONObject = {
            same: 5,
            changed: {
                insideChange: 12,
            },
        };
        const after: FirestoreJSONObject = {
            same: 5,
            changed: {
                insideChange: 0,
            },
        };
        const modified: Record<string, ObjectDifference> = {
            changed: new ObjectDifference({}, { insideChange: 0 }, {}),
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, modified, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('Should compare json inside a list deeply', () => {
        const before: FirestoreJSONObject = {
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
        const after: FirestoreJSONObject = {
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
        const before: FirestoreJSONValue = null;
        const after: FirestoreJSONObject = {
            someKey: 1,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: 1 }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle null values', () => {
        const before: FirestoreJSONObject = {
            someKey: null,
        };
        const after: FirestoreJSONObject = {
            someKey: null,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null value being set', () => {
        const before: FirestoreJSONObject = {
            someKey: null,
        };
        const after: FirestoreJSONObject = {
            someKey: true,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: true }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle an undefined value being set', () => {
        const before: FirestoreJSONObject = {
            someKey: undefined,
        };
        const after: FirestoreJSONObject = {
            someKey: true,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: true }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null object', () => {
        const before: FirestoreJSONObject = {
            someKey: 42,
        };
        const after: FirestoreJSONObject | null = null;
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 42 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle addition of new keys', () => {
        const before: FirestoreJSONObject = {
            someKey: 1,
        };
        const after: FirestoreJSONObject = {
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
        const before: FirestoreJSONObject = {
            someKey: null,
        };
        const after: FirestoreJSONObject = {
            someKey: 1,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: 1 }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle removal of keys', () => {
        const before: FirestoreJSONObject = {
            someKey: 1,
        };
        const after: FirestoreJSONObject = { };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 1 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle setting to null as removal', () => {
        const before: FirestoreJSONObject = {
            someKey: 1,
        };
        const after: FirestoreJSONObject = {
            someKey: null,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 1 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list of objects', () => {
        const before: FirestoreJSONObject = {
            someKey: [{ num: 1 }],
        };
        const after: FirestoreJSONObject = {
            someKey: [{ num: 4 }],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [{ num: 4 }] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle an identical list', () => {
        const before: FirestoreJSONObject = {
            someKey: [1],
        };
        const after: FirestoreJSONObject = {
            someKey: [1],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list', () => {
        const before: FirestoreJSONObject = {
            someKey: [1],
        };
        const after: FirestoreJSONObject = {
            someKey: [2],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [2] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list length', () => {
        const before: FirestoreJSONObject = {
            someKey: [1],
        };
        const after: FirestoreJSONObject = {
            someKey: [1, 2],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [1, 2] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should fail when a list becomes another type', () => {
        const before: FirestoreJSONObject = {
            someKey: [],
        };
        const after: FirestoreJSONObject = {
            someKey: 0,
        };
        expect(() => ObjectDifference.from(before, after)).toThrowError('Thing should not change type');
    });
});
