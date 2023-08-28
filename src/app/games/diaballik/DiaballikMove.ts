import { Move } from 'src/app/jscaip/Move';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { DiaballikState } from './DiaballikState';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { DiaballikFailure } from './DiaballikRules';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class DiaballikMove extends Move {

    public static encoder: Encoder<DiaballikMove> = Encoder.tuple(
        [MGPOptional.getEncoder(MoveCoordToCoord.encoder),
         MGPOptional.getEncoder(MoveCoordToCoord.encoder),
         MGPOptional.getEncoder(MoveCoordToCoord.encoder)],
        (move: DiaballikMove) => [move.firstTranslation, move.secondTranslation, move.pass],
        (fields: [MGPOptional<MoveCoordToCoord>, MGPOptional<MoveCoordToCoord>, MGPOptional<MoveCoordToCoord>]) => {
            return new DiaballikMove(fields[0], fields[1], fields[2])
        }
    );

    public static from(firstTranslation: MGPOptional<MoveCoordToCoord>,
                       secondTranslation: MGPOptional<MoveCoordToCoord>,
                       pass: MGPOptional<MoveCoordToCoord>)
    : MGPFallible<DiaballikMove> {
        const firstLegality: MGPValidation = DiaballikMove.subMoveValidity(firstTranslation);
        if (firstLegality.isFailure()) {
            return firstLegality.toOtherFallible();
        }
        const secondLegality: MGPValidation = DiaballikMove.subMoveValidity(secondTranslation);
        if (secondLegality.isFailure()) {
            return secondLegality.toOtherFallible();
        }
        if (pass.isPresent() && pass.get().getDirection().isFailure()) {
            return MGPFallible.failure(DiaballikFailure.PASS_MUST_BE_IN_STRAIGHT_LINE());
        }
        return MGPFallible.success(new DiaballikMove(firstTranslation, secondTranslation, pass));
    }
    private static subMoveValidity(translation: MGPOptional<MoveCoordToCoord>): MGPValidation {
        if (translation.isPresent()) {
            const actualTranslation: MoveCoordToCoord = translation.get();
            if (actualTranslation.length() !== 1 || actualTranslation.isOrthogonal() === false) {
                return MGPValidation.failure(DiaballikFailure.MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE());
            }
        }
        return MGPValidation.SUCCESS;
    }

    // TODO: can the pass be somewhere else than the last move? If so, adapt this
    private constructor(public readonly firstTranslation: MGPOptional<MoveCoordToCoord>,
                        public readonly secondTranslation: MGPOptional<MoveCoordToCoord>,
                        public readonly pass: MGPOptional<MoveCoordToCoord>) {
        super();
        Utils.assert(firstTranslation.isPresent() || secondTranslation.isPresent() || pass.isPresent(),
                     'DiaballikMove should at least do something');
        this.checkOnBoard(firstTranslation);
        this.checkOnBoard(secondTranslation);
        this.checkOnBoard(pass);
    }
    private checkOnBoard(move: MGPOptional<MoveCoordToCoord>): void {
        if (move.isPresent()) {
            Utils.assert(DiaballikState.isOnBoard(move.get().getStart()) &&
                         DiaballikState.isOnBoard(move.get().getEnd()),
                         'DiaballikMove not on board');
        }
    }
    public toString(): string {
        return `DiaballikMove(${this.firstTranslation.toString()}, ${this.secondTranslation.toString()}, ${this.pass.toString()})`;
    }
    public equals(other: this): boolean {
        if (this.firstTranslation.equals(other.firstTranslation) === false) return false;
        if (this.secondTranslation.equals(other.secondTranslation) === false) return false;
        if (this.pass.equals(other.pass) === false) return false;
        return true;
    }
}
