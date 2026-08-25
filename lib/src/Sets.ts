import { Comparable, comparableEquals } from './Comparable';

export class Sets {

    public static toComparableSet<T extends Comparable>(list: readonly T[]): T[] {
        const result: T[] = [];
        list.forEach((other: T) => {
            if (result.some((el: T) => comparableEquals(el, other)) === false) {
                result.push(other);
            }
        });
        return result;
    }

    public static getSubset<T>(items: T[], subsetSize: number): T[][] {
        if (subsetSize < 0 || subsetSize > items.length) {
            return [];
        }
        if (subsetSize === 0) {
            return [[]];
        }
        const result: T[][] = [];
        const current: T[] = [];
        function backtrack(start: number): void {
            if (current.length === subsetSize) {
                result.push([...current]);
                return;
            }
            const remaining = subsetSize - current.length;
            for (let i = start; i <= items.length - remaining; i++) {
                current.push(items[i]);
                backtrack(i + 1);
                current.pop();
            }
        }
        backtrack(0);
        return result;
    }

}
