import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Vector } from 'src/app/jscaip/Vector';
import { DiaballikFailure } from './DiaballikFailure';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';

export class DiaballikBallPass extends MoveCoordToCoord {

    public static encoder: Encoder<DiaballikBallPass> =
        MoveWithTwoCoords.getFallibleEncoder(DiaballikBallPass.from);

    public static from(start: Coord, end: Coord): MGPFallible<DiaballikBallPass> {
        const direction: MGPFallible<Direction> = Direction.factory.fromMove(start, end);
        if (direction.isFailure()) {
            return MGPFallible.failure(DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
        }
        return MGPFallible.success(new DiaballikBallPass(start, end));
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }

    public override equals(other: this): boolean {
        return other instanceof DiaballikBallPass && super.equals(other);
    }
}

export class DiaballikTranslation extends MoveCoordToCoord {

    public static encoder: Encoder<DiaballikTranslation> =
        MoveWithTwoCoords.getFallibleEncoder(DiaballikTranslation.from);

    public static from(start: Coord, end: Coord): MGPFallible<DiaballikTranslation> {
        const vector: Vector = start.getVectorToward(end);
        if (vector.isSingleOrthogonalStep()) {
            return MGPFallible.success(new DiaballikTranslation(start, end));
        } else {
            return MGPFallible.failure(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
        }
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }

    public override equals(other: this): boolean {
        return other instanceof DiaballikTranslation && super.equals(other);
    }
}

export type DiaballikSubMove = DiaballikBallPass | DiaballikTranslation;

export function isTranslation(subMove: DiaballikSubMove): subMove is DiaballikTranslation {
    return subMove instanceof DiaballikTranslation;
}

export function isBallPass(subMove: DiaballikSubMove): subMove is DiaballikBallPass {
    return subMove instanceof DiaballikBallPass;
}

type PassesAndTranslations = {
    passes: number,
    translations: number,
};

export class DiaballikMove extends Move {

    private static subMoveEncoder: Encoder<DiaballikSubMove> = Encoder.disjunction(
        [isTranslation, isBallPass],
        [DiaballikTranslation.encoder, DiaballikBallPass.encoder]);

    private static subMoveOptionalEncoder: Encoder<MGPOptional<DiaballikSubMove>> =
        MGPOptional.getEncoder(DiaballikMove.subMoveEncoder);

    public static encoder: Encoder<DiaballikMove> = Encoder.tuple(
        [DiaballikMove.subMoveEncoder, DiaballikMove.subMoveOptionalEncoder, DiaballikMove.subMoveOptionalEncoder],
        (move: DiaballikMove) => [move.first, move.second, move.third],
        (fields: [MoveCoordToCoord, MGPOptional<MoveCoordToCoord>, MGPOptional<MoveCoordToCoord>]) => {
            return new DiaballikMove(fields[0], fields[1], fields[2]);
        },
    );

    private static countPassesAndTranslations(subMove: DiaballikSubMove, passesAndTranslations: PassesAndTranslations)
    : void
    {
        if (subMove instanceof DiaballikBallPass) {
            passesAndTranslations.passes++;
        } else {
            passesAndTranslations.translations++;
        }
    }

    public constructor(public readonly first: DiaballikSubMove,
                       public readonly second: MGPOptional<DiaballikSubMove>,
                       public readonly third: MGPOptional<DiaballikSubMove>)
    {
        super();
        if (third.isPresent()) {
            Utils.assert(second.isPresent(), 'DiaballikMove should have two first actions to have a third one');
        }

        const passesAndTranslations: PassesAndTranslations = {
            passes: 0,
            translations: 0,
        };
        DiaballikMove.countPassesAndTranslations(first, passesAndTranslations);
        if (second.isPresent()) {
            DiaballikMove.countPassesAndTranslations(second.get(), passesAndTranslations);
        }
        if (third.isPresent()) {
            DiaballikMove.countPassesAndTranslations(third.get(), passesAndTranslations);
        }
        Utils.assert(passesAndTranslations.passes <= 1, 'DiaballikMove should have at most one pass');
        Utils.assert(passesAndTranslations.translations <= 2, 'DiaballikMove should have at most two translations');
    }

    public override toString(): string {
        return `DiaballikMove(${this.first.toString()}, ${this.second.toString()}, ${this.third.toString()})`;
    }

    public equals(other: this): boolean {
        if (this.first.equals(other.first) === false) return false;
        if (this.second.equals(other.second) === false) return false;
        if (this.third.equals(other.third) === false) return false;
        return true;
    }

    public getSubMoves(): DiaballikSubMove[] {
        const subMoves: DiaballikSubMove[] = [this.first];
        if (this.second.isPresent()) {
            subMoves.push(this.second.get());
        }
        if (this.third.isPresent()) {
            subMoves.push(this.third.get());
        }
        return subMoves;
    }
}
