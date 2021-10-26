import { ComparableObject } from 'src/app/utils/Comparable';

export abstract class Move implements ComparableObject {
    public abstract toString(): string;

    public abstract equals(o: this): boolean;
}
