import { Comparable, comparableEquals, ComparableObject } from '../Comparable';

export class Sets {

    public static toComparableObjectSet<T extends ComparableObject>(list: T[]): T[] {
        const result: T[] = [];
        list.forEach((o: T) => {
            if (!result.some((el: T) => el.equals(o))) {
                result.push(o);
            }
        });
        return result;
    }
    public static toComparableSet<T extends Comparable>(list: T[]): T[] {
        const result: T[] = [];
        list.forEach((o: T) => {
            if (!result.some((el: T) => comparableEquals(el, o))) {
                result.push(o);
            }
        });
        return result;
    }
}
