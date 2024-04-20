import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ComparableObject, Encoder, Utils } from '@everyboard/lib';

export enum Size {
    NONE = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}

export class EncapsulePiece implements ComparableObject {

    public static encoder: Encoder<EncapsulePiece> = Encoder.tuple(
        [Encoder.identity<number>()],
        (coord: EncapsulePiece) => [coord.value],
        (value: [number]) => EncapsulePiece.of(value[0]),
    );
    public static readonly SMALL_DARK: EncapsulePiece = new EncapsulePiece(0);
    public static readonly SMALL_LIGHT: EncapsulePiece = new EncapsulePiece(1);
    public static readonly MEDIUM_DARK: EncapsulePiece = new EncapsulePiece(2);
    public static readonly MEDIUM_LIGHT: EncapsulePiece = new EncapsulePiece(3);
    public static readonly BIG_DARK: EncapsulePiece = new EncapsulePiece(4);
    public static readonly BIG_LIGHT: EncapsulePiece = new EncapsulePiece(5);
    public static readonly NONE: EncapsulePiece = new EncapsulePiece(6);

    public static of(value: number): EncapsulePiece {
        switch (value) {
            case 0: return this.SMALL_DARK;
            case 1: return this.SMALL_LIGHT;
            case 2: return this.MEDIUM_DARK;
            case 3: return this.MEDIUM_LIGHT;
            case 4: return this.BIG_DARK;
            case 5: return this.BIG_LIGHT;
            case 6: return this.NONE;
            default: throw new Error('Invalid value ' + value + ' for EncapsulePiece');
        }
    }
    public static ofSizeAndPlayer(size: Size, player: PlayerOrNone): EncapsulePiece {
        if (player === Player.ZERO && size === Size.BIG) return EncapsulePiece.BIG_DARK;
        if (player === Player.ZERO && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_DARK;
        if (player === Player.ZERO && size === Size.SMALL) return EncapsulePiece.SMALL_DARK;
        if (player === Player.ONE && size === Size.BIG) return EncapsulePiece.BIG_LIGHT;
        if (player === Player.ONE && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_LIGHT;
        if (player === Player.ONE && size === Size.SMALL) return EncapsulePiece.SMALL_LIGHT;
        return EncapsulePiece.NONE;
    }

    private constructor(public readonly value: number) {
    }

    public getPlayer(): PlayerOrNone {
        switch (this) {
            case EncapsulePiece.SMALL_DARK:
            case EncapsulePiece.MEDIUM_DARK:
            case EncapsulePiece.BIG_DARK:
                return Player.ZERO;
            case EncapsulePiece.SMALL_LIGHT:
            case EncapsulePiece.MEDIUM_LIGHT:
            case EncapsulePiece.BIG_LIGHT:
                return Player.ONE;
            default:
                return PlayerOrNone.NONE;
        }
    }
    public getSize(): Size {
        switch (this) {
            case EncapsulePiece.BIG_DARK:
            case EncapsulePiece.BIG_LIGHT:
                return Size.BIG;
            case EncapsulePiece.MEDIUM_DARK:
            case EncapsulePiece.MEDIUM_LIGHT:
                return Size.MEDIUM;
            case EncapsulePiece.SMALL_DARK:
            case EncapsulePiece.SMALL_LIGHT:
                return Size.SMALL;
            default:
                Utils.expectToBe(this, EncapsulePiece.NONE);
                return Size.NONE;
        }
    }
    public belongsTo(player: Player): boolean {
        return this.getPlayer() === player;
    }
    public equals(other: EncapsulePiece): boolean {
        return this === other;
    }
    public toString(): string {
        switch (this) {
            case EncapsulePiece.BIG_DARK: return 'BIG_DARK';
            case EncapsulePiece.BIG_LIGHT: return 'BIG_LIGHT';
            case EncapsulePiece.MEDIUM_DARK: return 'MEDIUM_DARK';
            case EncapsulePiece.MEDIUM_LIGHT: return 'MEDIUM_LIGHT';
            case EncapsulePiece.SMALL_DARK: return 'SMALL_DARK';
            case EncapsulePiece.SMALL_LIGHT: return 'SMALL_LIGHT';
            default:
                Utils.expectToBe(this, EncapsulePiece.NONE);
                return 'EMPTY';
        }
    }
}
