import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { KamisadoBoard } from './KamisadoBoard';
import { Move } from 'src/app/jscaip/Move';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Utils } from 'src/app/utils/utils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type KamisadoMove = KamisadoPieceMove | KamisadoPassMove;

class KamisadoPassMove extends Move {

    public static PASS: KamisadoMove = new KamisadoPassMove();

    public static readonly encoder: Encoder<KamisadoPassMove> = Encoder.constant('PASS', KamisadoPassMove.PASS);

    private constructor() {
        super();
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

    public static readonly encoder: Encoder<KamisadoPieceMove> = MoveWithTwoCoords.getEncoder(KamisadoPieceMove.from);

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static from(start: Coord, end: Coord): MGPFallible<KamisadoPieceMove> {
        Utils.assert(start.isInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE),
                     'Starting coord of KamisadoMove must be on the board, not at ' + start.toString());
        Utils.assert(end.isInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE),
                     'End coord of KamisadoMove must be on the board, not at ' + end.toString());
        return MGPFallible.success(new KamisadoPieceMove(start, end));
    }
    public override equals(other: KamisadoMove): boolean {
        if (other === this) return true;
        if (KamisadoMove.isPiece(other)) {
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

    export function from(start: Coord, end: Coord): MGPFallible<KamisadoPieceMove> {
        return KamisadoPieceMove.from(start, end);
    }
    export function isPiece(move: KamisadoMove): move is KamisadoPieceMove {
        return move instanceof KamisadoPieceMove;
    }
    export function isPass(move: KamisadoMove): move is KamisadoPassMove {
        return move instanceof KamisadoPassMove;
    }
    export const encoder: Encoder<KamisadoMove> =
        Encoder.disjunction([KamisadoMove.isPiece, KamisadoMove.isPass],
                            [KamisadoPieceMove.encoder, KamisadoPassMove.encoder]);
}
