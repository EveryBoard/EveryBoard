import { MoveCoord } from "src/app/jscaip/MoveCoord";

export class SiamMove extends MoveCoord {

    public constructor(x: number, y: number, public readonly nature: SiamMoveNature) {
        super(x, y);
        SiamMove.checkValidity(this);
    }
    public static checkValidity(move: SiamMove) {
        if (move.coord.y < -1) throw new Error("Invalid y coord for SiamMove: " + move.coord.y);
        if (move.coord.x < -1) throw new Error("Invalid x coord for SiamMove: " + move.coord.x);
        if (move.coord.y > 5) throw new Error("Invalid y coord for SiamMove: " + move.coord.y);
        if (move.coord.x > 5) throw new Error("Invalid x coord for SiamMove: " + move.coord.x);

        if (move.coord.x === -1 || move.coord.x === 5) {
            if (move.nature.value !== 2) throw new Error("Cannot rotate piece outside the board");
            if (0 > move.coord.y || move.coord.y > 5) throw new Error("SiamPiece must be introduced next to the border");
        }

        if (move.coord.y === -1 || move.coord.y === 5) {
            if (move.nature.value !== 2) throw new Error("Cannot rotate piece outside the board");
            if (0 > move.coord.x || move.coord.x > 5) throw new Error("SiamPiece must be introduced next to the border");
        }
    }
    public decode(encodedMove: number): SiamMove {
        return SiamMove.decode(encodedMove);
    }
    public static decode(encodedMove: number): SiamMove {
        const y: number = encodedMove%7;
        encodedMove -= y;
        encodedMove/= 7;
        const x: number = encodedMove%7;
        encodedMove -= x;
        encodedMove/= 7;
        const nature: number = encodedMove;
        return new SiamMove(x - 1, y - 1, SiamMoveNature.decode(nature))
    }
    public encode(): number {
        const indexY: number = this.coord.y + 1; // 0 to 6 now
        const indexX: number = this.coord.x + 1; // 0 to 6 now
        return (49*this.nature.value) + (7*indexX) + indexY;
    }
    public equals(o: any): boolean {
        if (this === o) return true;
        if (!this.coord.equals(o.coord)) return false;
        if (this.nature !== o.nature) return false; // TODO: fix enum typing laxism problem
        return true;
    }
    public toString(): String {
        return "SiamMove(" + this.coord.x + ", "
                           + this.coord.y + ", "
                           + this.nature.toString()+")"
    }
    public static isForward(move: SiamMove): boolean {
        return move.nature.value === 2;
    }
    public isInsertion(): boolean {
        return SiamMove.isInsertion(this);
    }
    public static isInsertion(move: SiamMove): boolean {
        return move.coord.x === -1 ||
               move.coord.x === +5 ||
               move.coord.y === -1 ||
               move.coord.y === +5;
    }
}

export class SiamMoveNature {

    public static readonly CLOCKWISE: SiamMoveNature = new SiamMoveNature(0);

    public static readonly ANTI_CLOCKWISE: SiamMoveNature = new SiamMoveNature(1);

    public static readonly FORWARD: SiamMoveNature = new SiamMoveNature(2);

    public static decode(value: number) {
        switch (value) {
            case 0: return SiamMoveNature.CLOCKWISE;
            case 1: return SiamMoveNature.ANTI_CLOCKWISE;
            case 2: return SiamMoveNature.FORWARD;
            default: throw new Error("Unknown value for SiamMoveNature");
        };
    }
    private constructor(public readonly value: number) {
    }
    public toString(): String {
        switch (this.value) {
            case 0: return "CLOCKWISE";
            case 1: return "ANTI_CLOCKWISE";
            case 2: return "FORWARD";
        };
    }
}