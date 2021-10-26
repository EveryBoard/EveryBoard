import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils'; // TODOTODO defensive check in DB
import { ApagosCoord } from './ApagosCoord';
import { ApagosMessage } from './ApagosMessage';

export class ApagosMove extends Move {

    public static readonly ALL_MOVES: ApagosMove[] = [
        ApagosMove.drop(ApagosCoord.ZERO, Player.ZERO).get(),
        ApagosMove.drop(ApagosCoord.ONE, Player.ZERO).get(),
        ApagosMove.drop(ApagosCoord.TWO, Player.ZERO).get(),
        ApagosMove.drop(ApagosCoord.THREE, Player.ZERO).get(),
        ApagosMove.drop(ApagosCoord.ZERO, Player.ONE).get(),
        ApagosMove.drop(ApagosCoord.ONE, Player.ONE).get(),
        ApagosMove.drop(ApagosCoord.TWO, Player.ONE).get(),
        ApagosMove.drop(ApagosCoord.THREE, Player.ONE).get(),
        ApagosMove.slideDown(ApagosCoord.THREE, ApagosCoord.TWO).get(),
        ApagosMove.slideDown(ApagosCoord.THREE, ApagosCoord.ONE).get(),
        ApagosMove.slideDown(ApagosCoord.THREE, ApagosCoord.ZERO).get(),
        ApagosMove.slideDown(ApagosCoord.TWO, ApagosCoord.ONE).get(),
        ApagosMove.slideDown(ApagosCoord.TWO, ApagosCoord.ZERO).get(),
        ApagosMove.slideDown(ApagosCoord.ONE, ApagosCoord.ZERO).get(),
    ];
    public static encoder: NumberEncoder<ApagosMove> = new class extends NumberEncoder<ApagosMove> {

        public maxValue(): number {
            return 13;
        }
        public encodeNumber(move: ApagosMove): number {
            return ApagosMove.ALL_MOVES.indexOf(move);
        }
        public decodeNumber(encodedMove: number): ApagosMove {
            return ApagosMove.ALL_MOVES[encodedMove];
        }
    }
    public static drop(coord: ApagosCoord, piece: Player): MGPFallible<ApagosMove> {
        const drop: ApagosMove = new ApagosMove(coord, MGPOptional.of(piece), MGPOptional.empty());
        return MGPFallible.success(drop);
    }
    public static slideDown(start: ApagosCoord, landing: ApagosCoord): MGPFallible<ApagosMove> {
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
        throw new Error('TODOTODO');
    }
    public equals(o: Move): boolean {
        throw new Error('TODOTODO');
    }
}
