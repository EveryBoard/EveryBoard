import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils';
import { ApagosCoord } from './ApagosCoord';
import { ApagosFailure } from './ApagosFailure';

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
    public static encoder: NumberEncoder<ApagosMove> = new class extends NumberEncoder<ApagosMove> {

        public maxValue(): number {
            return ApagosMove.ALL_MOVES.length;
        }
        public encodeNumber(move: ApagosMove): number {
            const moveIndex: number = ApagosMove.ALL_MOVES.findIndex((m: ApagosMove) => m.equals(move));
            assert(moveIndex >= 0, move.toString() + ' is not part of possibles moves of Apagos!');
            return moveIndex;
        }
        public decodeNumber(encodedMove: number): ApagosMove {
            const move: ApagosMove = ApagosMove.ALL_MOVES[encodedMove];
            assert(move != null, encodedMove + ' is not a valid encoded number for ApagosMove decoder');
            return move;
        }
    }
    public static drop(coord: ApagosCoord, piece: Player): ApagosMove {
        const drop: ApagosMove = ApagosMove.ALL_MOVES.find((move: ApagosMove) => {
            return move.landing.equals(coord) &&
                   move.piece.equals(MGPOptional.of(piece)) &&
                   move.starting.equals(MGPOptional.empty());
        });
        return drop;
    }
    public static transfer(start: ApagosCoord, landing: ApagosCoord): MGPFallible<ApagosMove> {
        if (start.x <= landing.x) {
            return MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD());
        }
        const slideDown: ApagosMove = ApagosMove.ALL_MOVES.find((move: ApagosMove) => {
            return move.landing.equals(landing) &&
                   move.piece.equals(MGPOptional.empty()) &&
                   move.starting.equals(MGPOptional.of(start));
        });
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
    public equals(o: ApagosMove): boolean {
        if (this.starting.equals(o.starting) === false) return false;
        if (this.landing.equals(o.landing) === false) return false;
        return this.piece.equals(o.piece);
    }
}
