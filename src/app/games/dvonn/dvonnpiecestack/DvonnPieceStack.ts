import { DvonnPiece } from "../DvonnPiece";
import { Player } from "src/app/jscaip/Player";

export class DvonnPieceStack {
    public static of(v: number): DvonnPieceStack {
        const pieces = [];
        const size = v % DvonnPieceStack.MAX_SIZE;
        let value = (v / DvonnPieceStack.MAX_SIZE) | 0;
        for (let i = 0; i < size; i++) {
            const pieceValue = value % DvonnPiece.MAX_VALUE;
            value = (value / DvonnPiece.MAX_VALUE) | 0;
            pieces.push(DvonnPiece.of(pieceValue));
        }
        return new DvonnPieceStack(pieces.reverse());
    }
    public static MAX_SIZE: number = 49; // The maximal possible size for a stack
    public static EMPTY: DvonnPieceStack = new DvonnPieceStack([]);
    public static PLAYER_ZERO: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ZERO]);
    public static PLAYER_ONE: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.PLAYER_ONE]);
    public static SOURCE: DvonnPieceStack = new DvonnPieceStack([DvonnPiece.SOURCE]);

    public static append(stack1: DvonnPieceStack, stack2: DvonnPieceStack): DvonnPieceStack {
        return new DvonnPieceStack(stack1.pieces.concat(stack2.pieces));
    }

    constructor(public readonly pieces: ReadonlyArray<DvonnPiece>) {
    }
    public getValue(): number {
        let value = 0;
        for (const piece of this.pieces) {
            value = (value * DvonnPiece.MAX_VALUE) + piece.getValue();
        }
        value = (value * DvonnPieceStack.MAX_SIZE) + this.pieces.length;
        return value;
    }
    public belongsTo(player: Player): boolean {
        // A stack belongs to a player if the top piece belongs to that player
        return this.pieces.length > 0 && this.pieces[0].belongsTo(player);
    }
    public containsSource(): boolean {
        for (const piece of this.pieces) {
            if (piece.isSource()) {
                return true;
            }
        }
        return false;
    }
    public isEmpty(): boolean {
        return this.pieces.length === 0;
    }
    public size(): number {
        return this.pieces.length;
    }
    public toString(): string {
        let str = "[";
        for (const piece of this.pieces) {
            str += piece.toString();
        }
        return str + "]";
    }
}
