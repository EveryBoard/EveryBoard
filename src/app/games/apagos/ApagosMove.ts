import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils';
import { ApagosCoord } from './ApagosCoord';
import { ApagosMessage } from './ApagosMessage';

export class ApagosMove extends Move {

    public static readonly ALL_MOVES: ApagosMove[] = [
        ApagosMove.drop(ApagosCoord.ZERO, Player.ZERO),
        ApagosMove.drop(ApagosCoord.ONE, Player.ZERO),
        ApagosMove.drop(ApagosCoord.TWO, Player.ZERO),
        ApagosMove.drop(ApagosCoord.THREE, Player.ZERO),
        ApagosMove.drop(ApagosCoord.ZERO, Player.ONE),
        ApagosMove.drop(ApagosCoord.ONE, Player.ONE),
        ApagosMove.drop(ApagosCoord.TWO, Player.ONE),
        ApagosMove.drop(ApagosCoord.THREE, Player.ONE),
        ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.TWO).get(),
        ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ONE).get(),
        ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.ZERO).get(),
        ApagosMove.transfer(ApagosCoord.TWO, ApagosCoord.ONE).get(),
        ApagosMove.transfer(ApagosCoord.TWO, ApagosCoord.ZERO).get(),
        ApagosMove.transfer(ApagosCoord.ONE, ApagosCoord.ZERO).get(),
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
        const drop: ApagosMove = new ApagosMove(coord, MGPOptional.of(piece), MGPOptional.empty());
        return drop;
    }
    public static transfer(start: ApagosCoord, landing: ApagosCoord): MGPFallible<ApagosMove> {
        if (start.x <= landing.x) {
            return MGPFallible.failure(ApagosMessage.PIECE_SHOULD_MOVE_DOWNWARD());
        }
        const slideDown: ApagosMove = new ApagosMove(landing, MGPOptional.empty(), MGPOptional.of(start));
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
