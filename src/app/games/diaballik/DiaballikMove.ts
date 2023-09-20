import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { DiaballikState } from './DiaballikState';
import { DiaballikFailure } from './DiaballikRules';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Vector } from 'src/app/jscaip/Vector';

export class DiaballikPass extends MoveCoordToCoord {

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

    public static from(start: Coord, end: Coord): MGPFallible<DiaballikTranslation> {
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

    public static encoder: Encoder<DiaballikMove> = Encoder.tuple(
        [MoveCoordToCoord.encoder,
         MGPOptional.getEncoder(MoveCoordToCoord.encoder),
         MGPOptional.getEncoder(MoveCoordToCoord.encoder)],
        (move: DiaballikMove) => [move.first, move.second, move.third],
        (fields: [MoveCoordToCoord, MGPOptional<MoveCoordToCoord>, MGPOptional<MoveCoordToCoord>]) => {
            return new DiaballikMove(fields[0], fields[1], fields[2]);
        }
    );

    public constructor(public readonly first: DiaballikSubMove,
                       public readonly second: MGPOptional<DiaballikSubMove>,
                       public readonly third: MGPOptional<DiaballikSubMove>) {
        super();
        if (third.isPresent()) {
            Utils.assert(second.isPresent(), 'DiaballikMove should have two first actions to have a third one');
        }

        let passes: number = 0;
        if (first instanceof DiaballikPass) passes++;
        if (second.isPresent() && second instanceof DiaballikPass) passes++;
        if (third.isPresent() && third instanceof DiaballikPass) passes++;
        Utils.assert(passes <= 1, 'DiaballikMove should have at most one pass');
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
