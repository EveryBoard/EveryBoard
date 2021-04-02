import { getDiff, ObjectDifference } from './ObjectUtils';

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
});
