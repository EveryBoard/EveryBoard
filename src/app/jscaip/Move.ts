import { Comparable } from 'src/app/collectionlib/Comparable';

export abstract class Move implements Comparable {
    public abstract toString(): string;

    public abstract equals(o: any): boolean;

    public abstract encode(): number;

    public abstract decode(encodedMove: number): Move;
}
