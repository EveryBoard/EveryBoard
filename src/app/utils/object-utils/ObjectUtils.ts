export interface ObjectDifference {

    removed: { [key: string]: unknown };

    modified: { [key: string]: unknown };

    added: { [key: string]: unknown };
}
export const getDiff: (before: { [key: string]: any }, after: { [key: string]: any }) => ObjectDifference =
(before: { [key: string]: any }, after: { [key: string]: any }) => {
    const changes: ObjectDifference = {
        removed: {},
        modified: {},
        added: {},
    };
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
    for (const addedKey of addedKeys) {
        if (after[addedKey] != null) {
            changes.added[addedKey] = after[addedKey];
        }
    }
    for (const commonKey of commonKeys) {
        if (after[commonKey] == null) {
            if (before[commonKey] == null) {
                throw new Error('t nul pt1');
            }
            changes.removed[commonKey] = before[commonKey];
        } else if (typeof before[commonKey] === 'function' ||
                   typeof before[commonKey] === 'symbol' ||
                   typeof before[commonKey] === 'bigint')
        {
            throw new Error('Not implemented yet');
        } else if (typeof before[commonKey] === 'undefined') {
            throw new Error('YOU RE NOT A REAL VALUE ' + commonKey);
        } else if (typeof before[commonKey] === 'string' ||
                   typeof before[commonKey] === 'boolean' ||
                   typeof before[commonKey] === 'number')
        {
            if (before[commonKey] !== after[commonKey]) {
                changes.modified[commonKey] = after[commonKey];
            }
        } else if (typeof before[commonKey]['length'] === 'number') { // LIST
            if (typeof after[commonKey]['length'] === 'number') {
                if (before[commonKey].length === after[commonKey].length) {
                    let equal: boolean = true;
                    for (let i: number = 0; equal && i < before[commonKey]['length']; i++) {
                        const elementDiff: ObjectDifference = getDiff(before[commonKey][i], after[commonKey][i]);
                        const nbDiff: number = getDiffChangesNumber(elementDiff);
                        if (nbDiff > 0) {
                            equal = false;
                            changes.modified[commonKey] = after ? after[commonKey] : after;
                        }
                    }
                } else {
                    changes.modified[commonKey] = after[commonKey];
                }
            } else {
                throw new Error('Thing should not change type');
            }
        } else { // JSON
            const newDiff: ObjectDifference = getDiff(before[commonKey], after[commonKey]);
            const nbChanges: number = getDiffChangesNumber(newDiff);
            if (nbChanges > 0) {
                changes.modified[commonKey] = newDiff;
            }
        }
    }
    for (const removedKey of removedKeys) {
        changes.removed[removedKey] = before[removedKey];
    }
    return changes;
};
export const getDiffChangesNumber: (newDiff: ObjectDifference) => number =
(newDiff: ObjectDifference) => {
    const diffRemoval: number = Object.keys(newDiff.removed).length;
    const diffModified: number = Object.keys(newDiff.modified).length;
    const diffAdd: number = Object.keys(newDiff.added).length;
    return diffAdd + diffModified + diffRemoval;
};
