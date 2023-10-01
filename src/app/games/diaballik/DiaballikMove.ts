import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { DiaballikState } from './DiaballikState';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Vector } from 'src/app/jscaip/Vector';
import { DiaballikFailure } from './DiaballikFailure';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';

export class DiaballikPass extends MoveCoordToCoord {

    public static encoder: Encoder<DiaballikPass> = MoveWithTwoCoords.getFallibleEncoder(DiaballikPass.from);

    public static from(start: Coord, end: Coord): MGPFallible<DiaballikPass> {
        Utils.assert(DiaballikState.isOnBoard(start) && DiaballikState.isOnBoard(end), 'DiaballikMove not on board');
        const direction: MGPFallible<Direction> = Direction.factory.fromMove(start, end);
        if (direction.isFailure()) {
            return MGPFallible.failure(DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
        }
        return MGPFallible.success(new DiaballikPass(start, end));
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
}

export class DiaballikTranslation extends MoveCoordToCoord {

    public static encoder: Encoder<DiaballikTranslation> = MoveWithTwoCoords.getFallibleEncoder(DiaballikTranslation.from);

    public static from(start: Coord, end: Coord): MGPFallible<DiaballikTranslation> {
        Utils.assert(DiaballikState.isOnBoard(start) && DiaballikState.isOnBoard(end), 'DiaballikMove not on board');
        const vector: Vector = start.getVectorToward(end);
        if (vector.isUnitary() && vector.isOrthogonal()) {
            return MGPFallible.success(new DiaballikTranslation(start, end));
        } else {
            return MGPFallible.failure(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
        }
    }

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
}

export type DiaballikSubMove = DiaballikPass | DiaballikTranslation

export class DiaballikMove extends Move {

    private static subMoveEncoder: Encoder<DiaballikSubMove> = Encoder.disjunction(
        [(subMove: DiaballikSubMove): subMove is DiaballikTranslation => subMove instanceof DiaballikTranslation,
         (subMove: DiaballikSubMove): subMove is DiaballikPass => subMove instanceof DiaballikPass],
        [DiaballikTranslation.encoder, DiaballikPass.encoder]);

    private static subMoveOptionalEncoder: Encoder<MGPOptional<DiaballikSubMove>> =
        MGPOptional.getEncoder(DiaballikMove.subMoveEncoder);

    public static encoder: Encoder<DiaballikMove> = Encoder.tuple(
        [DiaballikMove.subMoveEncoder, DiaballikMove.subMoveOptionalEncoder, DiaballikMove.subMoveOptionalEncoder],
        (move: DiaballikMove) => [move.first, move.second, move.third],
        (fields: [MoveCoordToCoord, MGPOptional<MoveCoordToCoord>, MGPOptional<MoveCoordToCoord>]) => {
            return new DiaballikMove(fields[0], fields[1], fields[2]);
        }
    );

    public constructor(public readonly first: DiaballikSubMove,
                       public readonly second: MGPOptional<DiaballikSubMove>,
                       public readonly third: MGPOptional<DiaballikSubMove>)
    {
        super();
        if (third.isPresent()) {
            Utils.assert(second.isPresent(), 'DiaballikMove should have two first actions to have a third one');
        }

        let passes: number = 0;
        let translations: number = 0;
        if (first instanceof DiaballikPass) {
            passes++;
        } else {
            translations++;
        }
        if (second.isPresent()) {
            if (second.get() instanceof DiaballikPass) {
                passes++;
            } else {
                translations++;
            }
        }
        if (third.isPresent()) {
            if (third.get() instanceof DiaballikPass) {
                passes++;
            } else {
                translations++;
            }
        }
        Utils.assert(passes <= 1, 'DiaballikMove should have at most one pass');
        Utils.assert(translations <= 2, 'DiaballikMove should have at most two translations');
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
