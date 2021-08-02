import { getDiff, ObjectDifference } from '../ObjectUtils';

describe('getUpdateType', () => {
    it('Should name modified object', () => {
        const before: unknown = {
            same: 5,
            changed: {
                insideChange: 12,
            },
        };
        const after: unknown = {
            same: 5,
            changed: {
                insideChange: 0,
            },
        };
        const expectedDiff: ObjectDifference = {
            added: {},
            modified: {
                changed: {
                    added: {},
                    modified: {
                        insideChange: 0,
                    },
                    removed: {},
                },
            },
            removed: {},
        };
        const diff: ObjectDifference = getDiff(before, after);
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
        const expectedDiff: ObjectDifference = {
            added: {},
            modified: {},
            removed: {},
        };
        const diff: ObjectDifference = getDiff(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle null values', () => {
        const before: unknown = {
            someKey: null,
        };
        const after: unknown = {
            someKey: null,
        };
        const expectedDiff: ObjectDifference = {
            added: {},
            modified: {},
            removed: {},
        };
        const diff: ObjectDifference = getDiff(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null value being set', () => {
        const before: unknown = {
            someKey: null,
        };
        const after: unknown = {
            someKey: true,
        };
        const expectedDiff: ObjectDifference = {
            added: { someKey: true },
            modified: {},
            removed: {},
        };
        const diff: ObjectDifference = getDiff(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a null object', () => {
        const before: unknown = {
            someKey: 42,
        };
        const after: unknown = null;
        const expectedDiff: ObjectDifference = {
            added: {},
            modified: {},
            removed: { someKey: 42 },
        };
        const diff: ObjectDifference = getDiff(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should handle a modified list of objects', () => {
        const before: unknown = {
            someKey: [{ num: 1 }],
        };
        const after: unknown = {
            someKey: [{ num: 4 }],
        };
        const expectedDiff: ObjectDifference = {
            added: {},
            modified: { someKey: [{ num: 4 }] },
            removed: {},
        };
        const diff: ObjectDifference = getDiff(before, after);
        expect(diff).toEqual(expectedDiff);
    });
    it('should fail when a list becomes another type', () => {
        const before: unknown = {
            someKey: [],
        };
        const after: unknown = {
            someKey: 0,
        };
        expect(() => getDiff(before, after)).toThrowError('Thing should not change type');
    });
});
