import { Player } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';
import { Utils } from 'src/app/utils/utils';

export enum Size {
    NONE = 0,
    SMALL = 1,
    MEDIUM = 2,
    BIG = 3,
}

export class EncapsulePiece implements ComparableObject {

    public static readonly SMALL_BLACK: EncapsulePiece = new EncapsulePiece(0);
    public static readonly SMALL_WHITE: EncapsulePiece = new EncapsulePiece(1);
    public static readonly MEDIUM_BLACK: EncapsulePiece = new EncapsulePiece(2);
    public static readonly MEDIUM_WHITE: EncapsulePiece = new EncapsulePiece(3);
    public static readonly BIG_BLACK: EncapsulePiece = new EncapsulePiece(4);
    public static readonly BIG_WHITE: EncapsulePiece = new EncapsulePiece(5);
    public static readonly NONE: EncapsulePiece = new EncapsulePiece(6);

    public static of(value: number): EncapsulePiece {
        switch (value) {
            case 0: return this.SMALL_BLACK;
            case 1: return this.SMALL_WHITE;
            case 2: return this.MEDIUM_BLACK;
            case 3: return this.MEDIUM_WHITE;
            case 4: return this.BIG_BLACK;
            case 5: return this.BIG_WHITE;
            case 6: return this.NONE;
            default: throw new Error('Invalid value ' + value + ' for EncapsulePiece');
        }
    }
    public static ofSizeAndPlayer(size: Size, player: Player): EncapsulePiece {
        if (player === Player.ZERO && size === Size.BIG) return EncapsulePiece.BIG_BLACK;
        if (player === Player.ZERO && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_BLACK;
        if (player === Player.ZERO && size === Size.SMALL) return EncapsulePiece.SMALL_BLACK;
        if (player === Player.ONE && size === Size.BIG) return EncapsulePiece.BIG_WHITE;
        if (player === Player.ONE && size === Size.MEDIUM) return EncapsulePiece.MEDIUM_WHITE;
        if (player === Player.ONE && size === Size.SMALL) return EncapsulePiece.SMALL_WHITE;
        return EncapsulePiece.NONE;
    }

    private constructor(public readonly value: number) {
    }
    public getPlayer(): Player {
        switch (this) {
            case EncapsulePiece.SMALL_BLACK:
            case EncapsulePiece.MEDIUM_BLACK:
            case EncapsulePiece.BIG_BLACK:
                return Player.ZERO;
            case EncapsulePiece.SMALL_WHITE:
            case EncapsulePiece.MEDIUM_WHITE:
            case EncapsulePiece.BIG_WHITE:
                return Player.ONE;
            default:
                return Player.NONE;
        }
    }
    public getSize(): Size {
        switch (this) {
            case EncapsulePiece.BIG_BLACK:
            case EncapsulePiece.BIG_WHITE:
                return Size.BIG;
            case EncapsulePiece.MEDIUM_BLACK:
            case EncapsulePiece.MEDIUM_WHITE:
                return Size.MEDIUM;
            case EncapsulePiece.SMALL_BLACK:
            case EncapsulePiece.SMALL_WHITE:
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
            case EncapsulePiece.BIG_BLACK: return 'BIG_BLACK';
            case EncapsulePiece.BIG_WHITE: return 'BIG_WHITE';
            case EncapsulePiece.MEDIUM_BLACK: return 'MEDIUM_BLACK';
            case EncapsulePiece.MEDIUM_WHITE: return 'MEDIUM_WHITE';
            case EncapsulePiece.SMALL_BLACK: return 'SMALL_BLACK';
            case EncapsulePiece.SMALL_WHITE: return 'SMALL_WHITE';
            default:
                Utils.expectToBe(this, EncapsulePiece.NONE);
                return 'NONE';
        }
    }
}
