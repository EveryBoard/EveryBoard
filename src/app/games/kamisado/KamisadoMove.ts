import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { KamisadoBoard } from './KamisadoBoard';
import { Move } from 'src/app/jscaip/Move';

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

    export const encoder: NumberEncoder<KamisadoMove> = new class extends NumberEncoder<KamisadoMove> {
        public maxValue(): number {
            return 8 * 4096 + 8 * 256 + 8 * 16 + 8;
        }
        public encodeNumber(move: KamisadoMove): number {
            if (move.isPieceMove()) {
                const x1: number = move.getStart().x;
                const y1: number = move.getStart().y;
                const x2: number = move.getEnd().x;
                const y2: number = move.getEnd().y;
                return (x1 * 4096) + (y1 * 256) + (x2 * 16) + y2;
            } else {
                // 0 can never be an encoded piece move, as it would be a static move
                return 0;
            }
        }
        public decodeNumber(encodedMove: number): KamisadoMove {
            if (encodedMove === 0) return KamisadoMove.PASS;
            const y2: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const x2: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const y1: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const x1: number = encodedMove % 16;
            return KamisadoMove.of(new Coord(x1, y1), new Coord(x2, y2));
        }
    };
}
