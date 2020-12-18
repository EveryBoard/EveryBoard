import {Move} from './Move';

export class MoveX extends Move {
    private static pool: { [label: number]: MoveX } = {};
    public static get(x: number): MoveX {
        if (MoveX.pool[x] !== undefined) {
            return MoveX.pool[x];
        } else {
            const newMove: MoveX = new MoveX(x);
            MoveX.pool[x] = newMove;
            return newMove
        }
    }
    public static encode(move: MoveX): number {
        return move.x;
    }
    public static decode(encodedMove: number): MoveX {
        return MoveX.get(encodedMove);
    }

    protected constructor(public readonly x: number) {
        super();
    }
    public encode(): number {
        return MoveX.encode(this);
    }
    public decode(n: number): MoveX {
        return MoveX.decode(n);
    }
    public hashCode(): number {
        return this.x;
    }
    public equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (o === null) {
            return false;
        }
        const other: MoveX = <MoveX> o;
        if (this.x !== other.x) {
            return false;
        }
        return true;
    }
    public toString(): string {
        return 'MoveX(' + this.x + ')';
    }
}
