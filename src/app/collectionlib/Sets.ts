import { Comparable } from "./MGPMap";

export class Sets {

    static toNumberSet(list: number[]): number[] {
        const result: number[] = [];
        list.forEach(o => {
            if (!result.some(el => el === o)) {
                result.push(o);
            }
        });
        return result;
    }

    static toSet<O extends Comparable>(list: O[]): O[] {
        const result: O[] = [];
        list.forEach(o => {
            if (!result.some(el => el.equals(o))) {
                result.push(o);
            }
        });
        return result;
    }
}