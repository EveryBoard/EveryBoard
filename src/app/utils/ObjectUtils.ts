import { assert } from './assert';
import { FirestoreJSONObject, FirestoreJSONValue, FirestoreJSONValueWithoutArray } from './utils';

export class ObjectDifference {

    public static from(before: FirestoreJSONObject | null, after: FirestoreJSONObject | null): ObjectDifference {
        const changes: ObjectDifference = new ObjectDifference({}, {}, {});
        if (before == null) {
            changes.added = { ...after };
            return changes;
        }
        if (after == null) {
            changes.removed = { ...before };
            return changes;
        }
        const beforeKeys: string[] = Object.keys(before);
        const afterKeys: string[] = Object.keys(after);
        const removedKeys: string[] = beforeKeys.filter((k: string) => afterKeys.includes(k) === false);
        const commonKeys: string[] = beforeKeys.filter((k: string) => afterKeys.includes(k));
        const addedKeys: string[] = afterKeys.filter((k: string) => beforeKeys.includes(k) === false);
        changes.addNewKeys(addedKeys, after);
        changes.addCommonKeys(commonKeys, after, before);
        changes.addRemovedKeys(removedKeys, before);
        return changes;
    }
    public static differs(before: FirestoreJSONObject, after: FirestoreJSONObject): boolean {
        const elementDiff: ObjectDifference = ObjectDifference.from(before, after);
        const nbDiff: number = elementDiff.countChanges();
        return nbDiff > 0;
    }
    public constructor(public added: Record<string, FirestoreJSONValue>,
                       public modified: Record<string, FirestoreJSONValue | ObjectDifference>,
                       public removed: Record<string, FirestoreJSONValue>) {}
    private addNewKeys(addedKeys: string[], after: FirestoreJSONObject): void {
        for (const addedKey of addedKeys) {
            if (after[addedKey] != null) {
                this.added[addedKey] = after[addedKey];
            }
        }
    }
    private addCommonKeys(commonKeys: string[], after: FirestoreJSONObject, before: FirestoreJSONObject): void {
        for (const commonKey of commonKeys) {
            this.addCommonKey(commonKey, before[commonKey], after[commonKey]);
        }
    }
    private addCommonKey(commonKey: string, before: FirestoreJSONValue, after: FirestoreJSONValue): void {
        if (after == null) {
            if (before != null) {
                this.removed[commonKey] = before;
            }
        } else if (before == null) {
            // We know after != null at this point (otherwise we'd have taken the previous branch)
            this.added[commonKey] = after;
        } else if (['string', 'boolean', 'number'].includes(typeof before)) {
            if (before !== after) {
                this.modified[commonKey] = after;
            }
        } else if (Array.isArray(before)) {
            if (Array.isArray(after)) {
                if (before.length === after.length) {
                    this.addCommonKeyList(commonKey, before, after);
                } else {
                    this.modified[commonKey] = after;
                }
            } else {
                throw new Error('Thing should not change type');
            }
        } else { // JSON
            assert(typeof before === 'object', `ObjectDifference: expected JSON, but got a ${typeof before} in ${commonKey}`);
            assert(typeof after === 'object', `ObjectDifference: expected JSON, but got a ${typeof after} in ${commonKey}`);
            const beforeObject: FirestoreJSONObject = before as FirestoreJSONObject;
            const afterObject: FirestoreJSONObject = after as FirestoreJSONObject;
            const newDiff: ObjectDifference = ObjectDifference.from(beforeObject, afterObject);
            const nbChanges: number = newDiff.countChanges();
            if (nbChanges > 0) {
                this.modified[commonKey] = newDiff;
            }
        }
    }
    private addCommonKeyList(commonKey: string,
                             before: FirestoreJSONValueWithoutArray[],
                             after: FirestoreJSONValueWithoutArray[])
    : void
    {
        let equal: boolean = true;
        for (let i: number = 0; equal && i < before.length; i++) {
            if (typeof before[i] === typeof after[i] && typeof before[i] === 'object') {
                const beforeObject: FirestoreJSONObject = before[i] as FirestoreJSONObject;
                const afterObject: FirestoreJSONObject = after[i] as FirestoreJSONObject;
                if (ObjectDifference.differs(beforeObject, afterObject)) {
                    equal = false;
                    this.modified[commonKey] = after;
                }
            } else if (before[i] !== after[i]) {
                equal = false;
                this.modified[commonKey] = after;
            }
        }
    }
    private addRemovedKeys(removedKeys: string[], before: FirestoreJSONObject): void {
        for (const removedKey of removedKeys) {
            this.removed[removedKey] = before[removedKey];
        }
    }
    public countChanges(): number {
        const diffRemoval: number = Object.keys(this.removed).length;
        const diffModified: number = Object.keys(this.modified).length;
        const diffAdd: number = Object.keys(this.added).length;
        return diffAdd + diffModified + diffRemoval;
    }
    public isPresent(key: string): { state: 'added' | 'modified' | 'removed' | null, present: boolean } {
        if (this.added[key] != null) {
            return { state: 'added', present: true };
        }
        if (this.modified[key] != null) {
            return { state: 'modified', present: true };
        }
        if (this.removed[key] != null) {
            return { state: 'removed', present: true };
        }
        return { state: null, present: false };
    }
    public isFullyCreated(): boolean {
        return Object.keys(this.modified).length === 0 &&
               Object.keys(this.removed).length === 0;
    }
    public addedOrModified(key: string): boolean {
        const keyPresence: { state: 'added' | 'modified' | 'removed' | null, present: boolean } = this.isPresent(key);
        return keyPresence.present === true &&
               keyPresence.state !== 'removed';
    }
}
