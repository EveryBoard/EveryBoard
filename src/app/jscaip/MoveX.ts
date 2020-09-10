import {Move} from './Move';

export class MoveX extends Move {

    public static get(x: number): MoveX {
        const newMove: MoveX = new MoveX(x);
        for (const existingMove of MoveX.pool) {
            if (existingMove.equals(newMove)) {
                return existingMove;
            }
        }
        MoveX.pool.push(newMove);
        return newMove;
    }
    public static encode(move: MoveX): number {
        return move.x;
    }
    public static decode(encodedMove: number): MoveX {
        return MoveX.get(encodedMove);
    }
    private static pool: Array<MoveX> = new Array<MoveX>();

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