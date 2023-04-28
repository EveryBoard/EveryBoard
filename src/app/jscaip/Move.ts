import { ComparableObject } from 'src/app/utils/Comparable';

export abstract class Move implements ComparableObject {

    private readonly __nominal: void; // For strict typing

    public abstract toString(): string;

    public abstract equals(other: this): boolean;
}
