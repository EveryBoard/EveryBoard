import { Combinatorics } from './Combinatorics';
import { Comparable, comparableEquals } from './Comparable';
import { Set } from './Set';

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

    public static getSubsetsOfSize<T extends Comparable>(set: Set<T>, subsetSize: number): T[][] {
        return Combinatorics.getSubsetsOfSize(set.toList(), subsetSize);
    }

}
