import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder, NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { KamisadoBoard } from './KamisadoBoard';
import { Move } from 'src/app/jscaip/Move';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';

export type KamisadoMove = KamisadoPieceMove | KamisadoPassMove

class KamisadoPassMove extends Move {

    public static PASS: KamisadoMove = new KamisadoPassMove();

    private constructor() {
        super();
    }
    public isPieceMove(): this is KamisadoPieceMove {
        return false;
    }
    public length(): number {
        return 0;
    }
    public equals(that: KamisadoMove): boolean {
        return this === that;
    }
    public toString(): string {
        return 'KamisadoMove(PASS)';
    }
}

export class KamisadoPieceMove extends MoveCoordToCoord {
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static of(start: Coord, end: Coord): KamisadoPieceMove {
        if (start.isNotInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE)) {
            throw new Error('Starting coord of KamisadoMove must be on the board, not at ' + start.toString());
        }
        if (end.isNotInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE)) {
            throw new Error('End coord of KamisadoMove must be on the board, not at ' + end.toString());
        }
        return new KamisadoPieceMove(start, end);
    }
    public isPieceMove(): this is KamisadoPieceMove {
        return true;
    }
    public equals(other: KamisadoMove): boolean {
        if (other === this) return true;
        if (other.isPieceMove()) {
            if (other.getStart().equals(this.getStart()) === false) return false;
            return other.getEnd().equals(this.getEnd());
        } else {
            return false;
        }
    }
    public toString(): string {
        return 'KamisadoMove(' + this.getStart() + '->' + this.getEnd() + ')';
    }
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace KamisadoMove {
    export const PASS: KamisadoPassMove = KamisadoPassMove.PASS;

    export function of(start: Coord, end: Coord): KamisadoPieceMove {
        return KamisadoPieceMove.of(start, end);
    }

    const passEncoder: MoveEncoder<KamisadoPassMove> = MoveEncoder.constant('PASS', KamisadoMove.PASS);
    const pieceMoveEncoder: MoveEncoder<KamisadoPieceMove> = MoveWithTwoCoords.getEncoder(KamisadoPieceMove.of);
    export const encoder: MoveEncoder<KamisadoMove> =
        MoveEncoder.disjunction(pieceMoveEncoder,
                                passEncoder,
                                (m: KamisadoMove): m is KamisadoPieceMove => m.isPieceMove());
}
