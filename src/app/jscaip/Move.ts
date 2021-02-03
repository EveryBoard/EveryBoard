import { Comparable } from 'src/app/utils/collection-lib/Comparable';

export abstract class Move implements Comparable {
    public abstract toString(): string;

    public abstract equals(o: Move): boolean;

    public abstract encode(): number;

    public abstract decode(encodedMove: number): Move;
}
