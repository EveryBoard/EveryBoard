import { Comparable } from '../Comparable';

export class Sets {
    public static toImmutableSet<T>(list: T[]): T[] {
        const result: T[] = [];
        list.forEach((o) => {
            if (!result.some((el) => el === o)) {
                result.push(o);
            }
        });
        return result;
    }
    public static toNumberSet(list: number[]): number[] { // TODO: remove smartly for toImmutableSet
        const result: number[] = [];
        list.forEach((o) => {
            if (!result.some((el) => el === o)) {
                result.push(o);
            }
        });
        return result;
    }
    public static toSet<O extends Comparable>(list: O[]): O[] {
        const result: O[] = [];
        list.forEach((o) => {
            if (!result.some((el) => el.equals(o))) {
                result.push(o);
            }
        });
        return result;
    }
}
