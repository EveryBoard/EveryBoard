// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = { [key: string]: any };

export class ObjectDifference {

    public static from(before: Dictionary | null, after: Dictionary | null): ObjectDifference {
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
        changes.addCommonKey(commonKeys, after, before);
        changes.addRemovedKeys(removedKeys, before);
        return changes;
    }
    public constructor(public added: Dictionary,
                       public modified: Dictionary,
                       public removed: Dictionary) {}
    public addNewKeys(addedKeys: string[],
                      after: Dictionary)
    : void
    {
        for (const addedKey of addedKeys) {
            if (after[addedKey] != null) {
                this.added[addedKey] = after[addedKey];
            }
        }
    }
    public addCommonKey(commonKeys: string[],
                        after: Dictionary,
                        before: Dictionary)
    : void
    {
        for (const commonKey of commonKeys) {
            if (after[commonKey] == null) {
                if (before[commonKey] != null) {
                    this.removed[commonKey] = before[commonKey];
                }
            } else if (before[commonKey] == null) {
                if (after[commonKey] != null) {
                    this.added[commonKey] = after[commonKey];
                }
            } else if (['function', 'symbol', 'bigint'].includes(typeof before[commonKey])) {
                throw new Error('Not implemented yet');
            } else if (typeof before[commonKey] === 'undefined') {
                throw new Error('YOU RE NOT A REAL VALUE ' + commonKey);
            } else if (['string', 'boolean', 'number'].includes(typeof before[commonKey])) {
                if (before[commonKey] !== after[commonKey]) {
                    this.modified[commonKey] = after[commonKey];
                }
            } else if (typeof before[commonKey]['length'] === 'number') { // LIST
                if (typeof after[commonKey]['length'] === 'number') {
                    if (before[commonKey].length === after[commonKey].length) {
                        let equal: boolean = true;
                        for (let i: number = 0; equal && i < before[commonKey]['length']; i++) {
                            const elementDiff: ObjectDifference = ObjectDifference.from(before[commonKey][i],
                                                                                        after[commonKey][i]);
                            const nbDiff: number = elementDiff.countChanges();
                            if (nbDiff > 0) {
                                equal = false;
                                this.modified[commonKey] = after[commonKey];
                            }
                        }
                    } else {
                        this.modified[commonKey] = after[commonKey];
                    }
                } else {
                    throw new Error('Thing should not change type');
                }
            } else { // JSON
                const newDiff: ObjectDifference = ObjectDifference.from(before[commonKey], after[commonKey]);
                const nbChanges: number = newDiff.countChanges();
                if (nbChanges > 0) {
                    this.modified[commonKey] = newDiff;
                }
            }
        }
    }
    public countChanges(): number {
        const diffRemoval: number = Object.keys(this.removed).length;
        const diffModified: number = Object.keys(this.modified).length;
        const diffAdd: number = Object.keys(this.added).length;
        return diffAdd + diffModified + diffRemoval;
    }
    public addRemovedKeys(removedKeys: string[], before: Dictionary): void {
        for (const removedKey of removedKeys) {
            this.removed[removedKey] = before[removedKey];
        }
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
}
