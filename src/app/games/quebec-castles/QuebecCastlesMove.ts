import { Encoder, Set } from '@everyboard/lib';

import { Coord } from '../../../app/jscaip/Coord';
import { Move } from '../../../app/jscaip/Move';
import { MoveCoordToCoord } from '../../../app/jscaip/MoveCoordToCoord';

export type QuebecCastlesMove = QuebecCastlesTranslation | QuebecCastlesDrop;

export class QuebecCastlesTranslation extends MoveCoordToCoord {

    public static of(start: Coord, end: Coord): QuebecCastlesTranslation {
        return new QuebecCastlesTranslation(start, end);
    }

    public constructor(start: Coord, end: Coord) {
        super(start, end);
    }

    public override toString(): string {
        return 'QuebecCastlesTranslation(' + this.getStart().toString() + ' -> ' + this.getEnd().toString() + ')';
    }

    public override equals(other: QuebecCastlesMove): boolean {
        if (other instanceof QuebecCastlesTranslation) {
            return super.equals(other as this);
        } else {
            return false;
        }
    }

}

export class QuebecCastlesDrop extends Move {

    public static readonly encoder: Encoder<QuebecCastlesDrop> = Encoder.tuple(
        [Encoder.list(Coord.encoder)],
        (move: QuebecCastlesDrop) => [move.coords.toList()],
        (value: [Coord[]]) => QuebecCastlesDrop.of(value[0]),
    );

    public static of(coords: Coord[]): QuebecCastlesDrop {
        const asSet: Set<Coord> = new Set(coords);
        return new QuebecCastlesDrop(asSet);
    }

    private constructor(public readonly coords: Set<Coord>) {
        super();
    }

    public override toString(): string {
        return 'QuebecCastlesDrop(' + this.coords.toString() + ')';
    }

    public override equals(other: QuebecCastlesMove): boolean {
        if (other instanceof QuebecCastlesDrop) {
            return this.coords.equals(other.coords);
        } else {
            return false;
        }
    }

}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace QuebecCastlesMove {

    export function isTranslation(move: QuebecCastlesMove): move is QuebecCastlesTranslation {
        return move instanceof QuebecCastlesTranslation;
    }

    export function isDrop(move: QuebecCastlesMove): move is QuebecCastlesDrop {
        return move instanceof QuebecCastlesDrop;
    }

    export function drop(coords: Coord[]): QuebecCastlesMove {
        return QuebecCastlesDrop.of(coords);
    }

    export function translation(start: Coord, end: Coord): QuebecCastlesMove {
        return QuebecCastlesTranslation.of(start, end);
    }

    export const encoder: Encoder<QuebecCastlesMove> =
        Encoder.disjunction(
            [
                QuebecCastlesMove.isTranslation,
                QuebecCastlesMove.isDrop,
            ],
            [
                MoveCoordToCoord.getEncoder(QuebecCastlesTranslation.of),
                QuebecCastlesDrop.encoder,
            ],
        );
}
