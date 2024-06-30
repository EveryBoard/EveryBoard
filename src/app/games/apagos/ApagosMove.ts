import { Encoder, MGPFallible, MGPOptional } from '@everyboard/lib';
import { Move } from 'src/app/jscaip/Move';
import { Player } from 'src/app/jscaip/Player';
import { ApagosFailure } from './ApagosFailure';

type ApagosMoveFields = [number, MGPOptional<Player>, MGPOptional<number>]

export class ApagosMove extends Move {

    public static encoder: Encoder<ApagosMove> = Encoder.tuple(
        [
            Encoder.identity<number>(),
            MGPOptional.getEncoder(Player.encoder),
            MGPOptional.getEncoder(Encoder.identity<number>()),
        ],
        (m: ApagosMove): ApagosMoveFields => [m.landing, m.piece, m.starting],
        (fields: ApagosMoveFields): ApagosMove => new ApagosMove(fields[0], fields[1], fields[2]));

    public static drop(x: number, piece: Player): ApagosMove {
        return new ApagosMove(x, MGPOptional.of(piece), MGPOptional.empty());
    }

    public static transfer(start: number, landing: number): MGPFallible<ApagosMove> {
        if (start <= landing) {
            return MGPFallible.failure(ApagosFailure.PIECE_SHOULD_MOVE_DOWNWARD());
        }
        const slideDown: ApagosMove = new ApagosMove(landing, MGPOptional.empty(), MGPOptional.of(start));
        return MGPFallible.success(slideDown);
    }

    private constructor(public readonly landing: number,
                        public readonly piece: MGPOptional<Player>,
                        public readonly starting: MGPOptional<number>)
    {
        super();
    }

    public isDrop(): boolean {
        return this.piece.isPresent();
    }

    public toString(): string {
        if (this.isDrop()) {
            return 'ApagosMove.drop(' + this.piece.get().toString() + ' on ' + this.landing + ')';
        } else {
            return 'ApagosMove.slideDown(' + this.starting.get() + ' > ' + this.landing + ')';
        }
    }

    public equals(other: ApagosMove): boolean {
        if (this.landing !== other.landing) return false;
        if (this.starting.equals(other.starting) === false) return false;
        return this.piece.equals(other.piece);
    }
}
