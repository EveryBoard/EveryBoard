export abstract class Move {

    public abstract toString(): string;

    public abstract equals(o: any): boolean;

    public abstract encode(): number;

    public abstract decode(encodedMove: number): Move;
}