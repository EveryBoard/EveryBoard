import { Dictionary, ObjectDifference } from '../ObjectUtils';

describe('getUpdateType', () => {

    it('Should name modified object', () => {
        const before: Dictionary = {
            same: 5,
            changed: {
                insideChange: 12,
            },
        };
        const after: Dictionary = {
            same: 5,
            changed: {
                insideChange: 0,
            },
        };
        const modified: Dictionary = {
            changed: new ObjectDifference({}, { insideChange: 0 }, {}),
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, modified, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('Should compare json inside a list deeply', () => {
        const before: unknown = {
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
        const after: unknown = {
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
    it('should handle null values', () => {
        const before: unknown = {
            someKey: null,
        };
        const after: unknown = {
            someKey: null,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null value being set', () => {
        const before: unknown = {
            someKey: null,
        };
        const after: unknown = {
            someKey: true,
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({ someKey: true }, {}, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null object', () => {
        const before: unknown = {
            someKey: 42,
        };
        const after: unknown = null;
        const expectedDiff: ObjectDifference = new ObjectDifference({}, {}, { someKey: 42 });
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list of objects', () => {
        const before: unknown = {
            someKey: [{ num: 1 }],
        };
        const after: unknown = {
            someKey: [{ num: 4 }],
        };
        const expectedDiff: ObjectDifference = new ObjectDifference({}, { someKey: [{ num: 4 }] }, {});
        const diff: ObjectDifference = ObjectDifference.from(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should fail when a list becomes another type', () => {
        const before: unknown = {
            someKey: [],
        };
        const after: unknown = {
            someKey: 0,
        };
        expect(() => ObjectDifference.from(before, after)).toThrowError('Thing should not change type');
    });
});
