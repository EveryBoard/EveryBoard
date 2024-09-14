import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ComparableObject, Encoder } from '@everyboard/lib';

export enum Size {
    NONE = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}

export class EncapsulePiece implements ComparableObject {

    public static encoder: Encoder<EncapsulePiece> = Encoder.tuple(
        [Encoder.identity<number>(), Player.encoder],
        (piece: EncapsulePiece) => [piece.size, piece.owner],
        (value: [Size, PlayerOrNone]) => EncapsulePiece.ofSizeAndPlayer(value[0], value[1]),
    );

    public static readonly NONE: EncapsulePiece = new EncapsulePiece(Size.NONE, PlayerOrNone.NONE);

    public static ofSizeAndPlayer(size: Size, player: PlayerOrNone): EncapsulePiece {
        if (player.isNone() || size === Size.NONE) {
            return EncapsulePiece.NONE;
        } else {
            return new EncapsulePiece(size, player);
        }
    }

    private constructor(public readonly size: Size, public readonly owner: PlayerOrNone) {
    }

    public getPlayer(): PlayerOrNone {
        return this.owner;
    }

    public getSize(): Size {
        return this.size;
    }

    public belongsTo(player: Player): boolean {
        return this.getPlayer() === player;
    }

    public equals(other: EncapsulePiece): boolean {
        return this.size === other.size &&
               this.owner.equals(other.owner);
    }

    public toString(): string {
        return 'size-' + this.size + '-' + this.getPlayer().toString();
    }

}
