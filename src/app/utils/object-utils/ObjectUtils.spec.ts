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
});