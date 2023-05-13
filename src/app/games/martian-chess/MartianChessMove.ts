import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Vector } from 'src/app/jscaip/Vector';

export class MartianChessMoveFailure {

    public static readonly START_COORD_OUT_OF_RANGE: Localized = () => $localize`Start coord cannot be out of range`;

    public static readonly END_COORD_OUT_OF_RANGE: Localized = () => $localize`End coord cannot be out of range`;

    public static readonly PAWN_MUST_MOVE_ONE_DIAGONAL_STEP: Localized = () => $localize`Pawns must move one step diagonally.`;

    public static readonly DRONE_MUST_DO_TWO_ORTHOGONAL_STEPS: Localized = () => $localize`Drones must move one or two steps in any direction.`;
}

export class MartianChessMove extends MoveCoordToCoord {

    public static encoder: NumberEncoder<MartianChessMove> = NumberEncoder.tuple(
        [Coord.numberEncoder(4, 8), Coord.numberEncoder(4, 8), NumberEncoder.booleanEncoder],
        (move: MartianChessMove): [Coord, Coord, boolean] => [move.getStart(), move.getEnd(), move.calledTheClock],
        (f: [Coord, Coord, boolean]): MartianChessMove => MartianChessMove.from(f[0], f[1], f[2]).get(),
    );
    public static from(start: Coord, end: Coord, calledTheClock: boolean = false): MGPFallible<MartianChessMove> {
        if (start.isNotInRange(4, 8)) {
            return MGPFallible.failure(MartianChessMoveFailure.START_COORD_OUT_OF_RANGE());
        }
        if (end.isNotInRange(4, 8)) {
            return MGPFallible.failure(MartianChessMoveFailure.END_COORD_OUT_OF_RANGE());
        }
        if (end.equals(start)) {
            return MGPFallible.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        }
        const dir: MGPFallible<Direction> = Direction.factory.fromDelta(end.x - start.x, end.y - start.y);
        if (dir.isFailure()) {
            return MGPFallible.failure(dir.getReason());
        }
        return MGPFallible.success(new MartianChessMove(start, end, calledTheClock));
    }
    private constructor(start: Coord, end: Coord, public readonly calledTheClock: boolean) {
        super(start, end);
    }
    public toString(): string {
        const ending: string = this.calledTheClock ? ', CALL_THE_CLOCK' : '';
        return 'MartianChessMove((' + this.getStart().x + ', ' + this.getStart().y + ') -> (' +
                                      this.getEnd().x + ', ' + this.getEnd().y + ')' +
                                      ending + ')';
    }
    public equals(other: MartianChessMove): boolean {
        if (this.getStart().equals(other.getStart()) === false) return false;
        if (this.getEnd().equals(other.getEnd()) === false) return false;
        return this.calledTheClock === other.calledTheClock;
    }
    public isValidForPawn(): boolean {
        const vector: Vector = this.getStart().getVectorToward(this.getEnd());
        return vector.isDiagonalOfLength(1);
    }
    public isValidForDrone(): boolean {
        const distance: number = this.getStart().getDistance(this.getEnd());
        return distance <= 2;
    }
    public isUndoneBy(moveOpt: MGPOptional<MartianChessMove>): boolean {
        if (moveOpt.isAbsent()) {
            return false;
        }
        const move: MartianChessMove = moveOpt.get();
        return move.getEnd().equals(this.getStart()) && move.getStart().equals(this.getEnd());
    }
}
