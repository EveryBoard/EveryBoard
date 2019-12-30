import { Move } from "src/app/jscaip/Move";
import { Coord } from "src/app/jscaip/Coord";
import { EncapsulePiece } from "./EncapsulePiece";
import { EncapsuleCase } from "./EncapsulePartSlice";

export class EncapsuleMove extends Move {

    static decode(encodedMove: number): EncapsuleMove {
        const d: number = encodedMove%2;
        encodedMove -= d;
        encodedMove = encodedMove/2;
        const ly: number = encodedMove%3;
        encodedMove -= ly;
        encodedMove = encodedMove/3;
        const lx: number = encodedMove%3;
        encodedMove -= lx;
        encodedMove = encodedMove/3;
        const landingCoord: Coord = new Coord(lx, ly);
        if (d === 0) { // drop
            const piece: EncapsulePiece = encodedMove;
            return EncapsuleMove.fromDrop(piece, landingCoord)
        } else {
            const sy: number = encodedMove%3;
            encodedMove -= sy;
            encodedMove = encodedMove/3;
            const sx: number = encodedMove%3;
            const startingCoord: Coord = new Coord(sx, sy);
            return EncapsuleMove.fromMove(startingCoord, landingCoord);
        }
    }

    public decode(encodedMove: number): EncapsuleMove {
        return EncapsuleMove.decode(encodedMove);
    }

    public encode(): number {
        /* d: 0|1
         *     - 0: c'est un drop
         *     - 1: c'est un move
         * ly: 0|1|2
         * lx: 0|1|2
         * si c'était un drop
         *     - piece: [0: 5]
         * si c'était un move
         *     - sy: 0, 1, 2
         *     - sx: 0, 1, 2
         * donc :
         *     - piece;lx;ly;d
         *     - sx;sy;lx;ly;d
         */
        const lx: number = this.landingCoord.x;
        const ly: number = this.landingCoord.y;
        if (this.isDropping()) {
            const d: number = 0;
            const piece: number = this.piece;
            return (piece*18) + (lx*6) + (ly*2) + d;
        } else {
            const d: number = 1;
            const sy: number = this.startingCoord.y;
            const sx: number = this.startingCoord.x;
            return (sx*54) + (sy*18) + (lx*6) + (ly*2) + d;
        }
    }

    public readonly startingCoord: Coord | null;

    public readonly landingCoord: Coord;

    public readonly piece: null | EncapsulePiece;

    private constructor(startingCoord: Coord, landingCoord: Coord, piece: EncapsulePiece) {
        super();
        if (landingCoord == null) throw new Error("Landing Coord cannot be null");
        if (startingCoord == null && piece == null) throw new Error("One of startingCoord and piece must be null");
        if (startingCoord != null && piece != null) throw new Error("One of startingCoord and piece must be initialised");
        this.startingCoord = startingCoord;
        this.landingCoord = landingCoord;
        this.piece = piece;
    }

    static fromMove(startingCoord: Coord, landingCoord: Coord): EncapsuleMove {
        return new EncapsuleMove(startingCoord, landingCoord, null);
    }

    static fromDrop(piece: EncapsulePiece, landingCoord: Coord): EncapsuleMove {
        return new EncapsuleMove(null, landingCoord, piece);
    }

    isDropping() {
        return this.startingCoord === null;
    }

    public equals(o: any) {
        if (this === o) {
            return true;
        }
        if (o === null) {
            return false;
        }
        if (!(o instanceof EncapsuleMove)) {
            return false;
        }
        const other: EncapsuleMove = o as EncapsuleMove;
        if (!other.landingCoord.equals(this.landingCoord)) {
            return false;
        }
        if (this.startingCoord == null && other.startingCoord != null) {
            return false;
        } else {
            if (!this.startingCoord.equals(other.startingCoord)) {
                return false;
            }
        }
        if (this.piece !== other.piece) {
            return false;
        }
        return true;
    }

    public toString(): string {
        if (this.isDropping()) {
            return "EncapsuleMove(" + EncapsuleCase.getNameFromPiece(this.piece) + " -> " + this.landingCoord + ")";
        } else {
            return "EncapsuleMove(" + this.startingCoord + "->" + this.landingCoord + ")";
        }
    }
}