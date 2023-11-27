import { Encoder } from '@everyboard/lib';
import { Move } from 'src/app/jscaip/Move';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from '@everyboard/lib';
import { MGPOptional } from '@everyboard/lib';
import { Utils } from '@everyboard/lib';
import { ApagosCoord } from './ApagosCoord';
import { ApagosFailure } from './ApagosFailure';

type ApagosMoveFields = [ApagosCoord, MGPOptional<Player>, MGPOptional<ApagosCoord>]

export class ApagosMove extends Move {

    public static readonly ALL_MOVES: ApagosMove[] = [
        new ApagosMove(ApagosCoord.ZERO, MGPOptional.of(Player.ZERO), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.ONE, MGPOptional.of(Player.ZERO), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.TWO, MGPOptional.of(Player.ZERO), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.THREE, MGPOptional.of(Player.ZERO), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.ZERO, MGPOptional.of(Player.ONE), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.ONE, MGPOptional.of(Player.ONE), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.TWO, MGPOptional.of(Player.ONE), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.THREE, MGPOptional.of(Player.ONE), MGPOptional.empty()),
        new ApagosMove(ApagosCoord.TWO, MGPOptional.empty(), MGPOptional.of(ApagosCoord.THREE)),
        new ApagosMove(ApagosCoord.ONE, MGPOptional.empty(), MGPOptional.of(ApagosCoord.THREE)),
        new ApagosMove(ApagosCoord.ZERO, MGPOptional.empty(), MGPOptional.of(ApagosCoord.THREE)),
        new ApagosMove(ApagosCoord.ONE, MGPOptional.empty(), MGPOptional.of(ApagosCoord.TWO)),
        new ApagosMove(ApagosCoord.ZERO, MGPOptional.empty(), MGPOptional.of(ApagosCoord.TWO)),
        new ApagosMove(ApagosCoord.ZERO, MGPOptional.empty(), MGPOptional.of(ApagosCoord.ONE)),
    ];
    public static encoder: Encoder<ApagosMove> = Encoder.tuple(
        [ApagosCoord.encoder, MGPOptional.getEncoder(Player.encoder), MGPOptional.getEncoder(ApagosCoord.encoder)],
        (m: ApagosMove): ApagosMoveFields => [m.landing, m.piece, m.starting],
        (fields: ApagosMoveFields): ApagosMove => new ApagosMove(fields[0], fields[1], fields[2]));

    public static drop(coord: ApagosCoord, piece: Player): ApagosMove {
        const drop: ApagosMove = Utils.getNonNullable(
            ApagosMove.ALL_MOVES.find((move: ApagosMove) => {
                return move.landing.equals(coord) &&
                    move.piece.equalsValue(piece) &&
                    move.starting.equals(MGPOptional.empty());
            }));
        return drop;
    }
    public static transfer(start: ApagosCoord, landing: ApagosCoord): MGPFallible<ApagosMove> {
        if (start.x <= landing.x) {
            return MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD());
        }
        const slideDown: ApagosMove = Utils.getNonNullable(
            ApagosMove.ALL_MOVES.find((move: ApagosMove) => {
                return move.landing.equals(landing) &&
                    move.piece.equals(MGPOptional.empty()) &&
                    move.starting.equals(MGPOptional.of(start));
            }));
        return MGPFallible.success(slideDown);
    }
    private constructor(public readonly landing: ApagosCoord,
                        public readonly piece: MGPOptional<Player>,
                        public readonly starting: MGPOptional<ApagosCoord>)
    {
        super();
    }
    public isDrop(): boolean {
        return this.piece.isPresent();
    }
    public toString(): string {
        if (this.isDrop()) {
            return 'ApagosMove.drop(' + this.piece.get().toString() + ' on ' + this.landing.x + ')';
        } else {
            return 'ApagosMove.slideDown(' + this.starting.get().x + ' > ' + this.landing.x + ')';
        }
    }
    public equals(other: ApagosMove): boolean {
        if (this.starting.equals(other.starting) === false) return false;
        if (this.landing.equals(other.landing) === false) return false;
        return this.piece.equals(other.piece);
    }
}
