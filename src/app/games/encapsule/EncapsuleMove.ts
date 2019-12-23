import { Move } from "src/app/jscaip/Move";
import { Coord } from "src/app/jscaip/Coord";
import { EncapsulePiece } from "./EncapsulePiece";

export class EncapsuleMove extends Move {

    public readonly startingCoord: Coord | null;

    public readonly landingCoord: Coord;

    public readonly piece: null | EncapsulePiece;

    private constructor(startingCoord: Coord, landingCoord: Coord, piece: EncapsulePiece) {
        super();
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
}