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
    describe('isPresent', () => {
        it('should know when a field has been removed', () => {
            // Given a diff created from a removed field
            const before: FirestoreJSONObject = {
                dyingField: true,
            };
            const after: FirestoreJSONObject = {
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if the removed field is present in the diff (and how)
            const isPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } =
                diff.isPresent('dyingField');

            // Then it should say that it is present, as a removed field !
            const expectedIsPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } = {
                state: 'removed',
                present: true,
            };
            expect(isPresent).toEqual(expectedIsPresent);
        });
        it('should know when a field has been added', () => {
            // Given a diff created from an added field
            const before: FirestoreJSONObject = {
            };
            const after: FirestoreJSONObject = {
                addedKey: 'yes',
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if the added field is present in the diff (and how)
            const isPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } =
                diff.isPresent('addedKey');

            // Then it should say that it is present, as an added field !
            const expectedIsPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } = {
                state: 'added',
                present: true,
            };
            expect(isPresent).toEqual(expectedIsPresent);
        });
        it('should know when a field has been modified', () => {
            // Given a diff created from a modified field
            const before: FirestoreJSONObject = {
                modifiedKey: 42,
            };
            const after: FirestoreJSONObject = {
                modifiedKey: 73,
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if the modified field is present in the diff (and how)
            const isPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } =
                diff.isPresent('modifiedKey');

            // Then it should say that it is present, as a modified field !
            const expectedIsPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } = {
                state: 'modified',
                present: true,
            };
            expect(isPresent).toEqual(expectedIsPresent);
        });
        it('should know when a field is absent', () => {
            // Given a diff
            const before: FirestoreJSONObject = {
                modifiedKey: 42,
            };
            const after: FirestoreJSONObject = {
                modifiedKey: 73,
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if unknown field is present in the diff (and how)
            const isPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } =
                diff.isPresent('JimCarreyIlEstFunny');

            // Then it should say that it is absent
            const expectedIsPresent: { state: 'added' | 'modified' | 'removed' | null, present: boolean } = {
                state: null,
                present: false,
            };
            expect(isPresent).toEqual(expectedIsPresent);
        });
    });
    describe('isFullyCreated', () => {
        it('should return false when there is removed fields', () => {
            // Given a diff created from one removed fields and one created
            const before: FirestoreJSONObject = {
                someKey: 5,
            };
            const after: FirestoreJSONObject = {
                createdKey: 'yes',
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if the diff is fully created
            const isFullyCreated: boolean = diff.isFullyCreated();

            // Then it should be false
            expect(isFullyCreated).toBeFalse();
        });
        it('should return false when there is modified fields', () => {
            // Given a diff created from one modified fields and one created
            const before: FirestoreJSONObject = {
                modifiedKey: 'ah oui mais non hein',
            };
            const after: FirestoreJSONObject = {
                modifiedKey: 'yes',
                someKey: 5,
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if the diff is fully created
            const isFullyCreated: boolean = diff.isFullyCreated();

            // Then it should be false
            expect(isFullyCreated).toBeFalse();
        });
        it('should return true when every field included are added', () => {
            // Given a diff created from one added fields and one untouched
            const before: FirestoreJSONObject = {
                untouchedKey: 'ah oui mais non hein',
            };
            const after: FirestoreJSONObject = {
                untouchedKey: 'ah oui mais non hein',
                addedKey: 5,
            };
            const diff: ObjectDifference = ObjectDifference.from(before, after);

            // When asking if the diff is fully created
            const isFullyCreated: boolean = diff.isFullyCreated();

            // Then it should be true
            expect(isFullyCreated).toBeTrue();
        });
    });
});
