import { Move } from "src/app/jscaip/Move";
import { Coord } from "src/app/jscaip/Coord";
import { EncapsulePiece, EncapsuleMapper } from "../EncapsuleEnums";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

export class EncapsuleMove extends Move {

    public static decode(encodedMove: number): EncapsuleMove {
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
            const piece: EncapsulePiece = EncapsulePiece.of(encodedMove);
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
    public static encode(move: EncapsuleMove): number {
        return move.encode();
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
         * si c'�tait un drop
         *     - piece: [0: 5]
         * si c'�tait un move
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
            const piece: number = this.piece.get().value;
            return (piece*18) + (lx*6) + (ly*2) + d;
        } else {
            const d: number = 1;
            const sy: number = this.startingCoord.get().y;
            const sx: number = this.startingCoord.get().x;
            return (sx*54) + (sy*18) + (lx*6) + (ly*2) + d;
        }
    }
    private constructor(public readonly startingCoord: MGPOptional<Coord>,
                        public readonly landingCoord: Coord,
                        public readonly piece: MGPOptional<EncapsulePiece>) {
        super();
        if (startingCoord == null) throw new Error("Starting Coord's optional can't be null");
        if (landingCoord == null) throw new Error("Landing Coord can't be null");
        if (piece == null) throw new Error("Piece's optional can't be null");
    }
    public static fromMove(startingCoord: Coord, landingCoord: Coord): EncapsuleMove {
        if (startingCoord.equals(landingCoord)) throw new Error("Starting coord and landing coord must be separate coords");
        return new EncapsuleMove(MGPOptional.of(startingCoord), landingCoord, MGPOptional.empty());
    }
    public static fromDrop(piece: EncapsulePiece, landingCoord: Coord): EncapsuleMove {
        return new EncapsuleMove(MGPOptional.empty(), landingCoord, MGPOptional.of(piece));
    }
    public isDropping() {
        return this.startingCoord.isAbsent();
    }
    public equals(o: any): boolean {
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
            if (this.startingCoord != null) {
                if (!this.startingCoord.equals(other.startingCoord)) {
                    return false;
                }
            }
        }
        if (this.piece !== other.piece) {
            return false;
        }
        return true;
    }
    public toString(): String {
        if (this.isDropping()) {
            return "EncapsuleMove(" + EncapsuleMapper.getNameFromPiece(this.piece.get()) + " -> " + this.landingCoord + ")";
        } else {
            return "EncapsuleMove(" + this.startingCoord.get() + "->" + this.landingCoord + ")";
        }
    }
}