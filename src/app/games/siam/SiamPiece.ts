import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Utils } from '@everyboard/lib';
import { MGPOptional } from '@everyboard/lib';

export type SiamPieceValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export class SiamPiece {

    public static readonly EMPTY: SiamPiece = new SiamPiece(0);

    public static readonly LIGHT_UP: SiamPiece = new SiamPiece(1);

    public static readonly LIGHT_RIGHT: SiamPiece = new SiamPiece(2);

    public static readonly LIGHT_DOWN: SiamPiece = new SiamPiece(3);

    public static readonly LIGHT_LEFT: SiamPiece = new SiamPiece(4);

    public static readonly DARK_UP: SiamPiece = new SiamPiece(5);

    public static readonly DARK_RIGHT: SiamPiece = new SiamPiece(6);

    public static readonly DARK_DOWN: SiamPiece = new SiamPiece(7);

    public static readonly DARK_LEFT: SiamPiece = new SiamPiece(8);

    public static readonly MOUNTAIN: SiamPiece = new SiamPiece(9);

    public static decode(value: SiamPieceValue): SiamPiece {
        switch (value) {
            case 0: return SiamPiece.EMPTY;
            case 1: return SiamPiece.LIGHT_UP;
            case 2: return SiamPiece.LIGHT_RIGHT;
            case 3: return SiamPiece.LIGHT_DOWN;
            case 4: return SiamPiece.LIGHT_LEFT;
            case 5: return SiamPiece.DARK_UP;
            case 6: return SiamPiece.DARK_RIGHT;
            case 7: return SiamPiece.DARK_DOWN;
            case 8: return SiamPiece.DARK_LEFT;
            case 9: return SiamPiece.MOUNTAIN;
        }
    }
    public belongsTo(player: Player): boolean {
        if (player === Player.ZERO) {
            return (1 <= this.value && this.value <= 4);
        } else {
            return (5 <= this.value && this.value <= 8);
        }
    }
    public isEmptyOrMountain(): boolean {
        return this.value === 0 || this.value === 9;
    }
    public isPiece(): boolean {
        return this.isEmptyOrMountain() === false;
    }
    public getOwner(): PlayerOrNone {
        if (1 <= this.value && this.value <= 4) return Player.ZERO;
        if (5 <= this.value && this.value <= 8) return Player.ONE;
        return PlayerOrNone.NONE;
    }
    public getOptionalDirection(): MGPOptional<Orthogonal> {
        switch (this.value) {
            case 0: return MGPOptional.empty();
            case 1: return MGPOptional.of(Orthogonal.UP);
            case 5: return MGPOptional.of(Orthogonal.UP);
            case 2: return MGPOptional.of(Orthogonal.RIGHT);
            case 6: return MGPOptional.of(Orthogonal.RIGHT);
            case 3: return MGPOptional.of(Orthogonal.DOWN);
            case 7: return MGPOptional.of(Orthogonal.DOWN);
            case 4: return MGPOptional.of(Orthogonal.LEFT);
            case 8: return MGPOptional.of(Orthogonal.LEFT);
            default:
                // must be 9, according to this.value's type
                Utils.expectToBe(this.value, 9);
                return MGPOptional.empty();
        }
    }
    public static of(orientation: Orthogonal, player: Player): SiamPiece {
        if (player === Player.ZERO) {
            if (orientation === Orthogonal.UP) return SiamPiece.LIGHT_UP;
            if (orientation === Orthogonal.RIGHT) return SiamPiece.LIGHT_RIGHT;
            if (orientation === Orthogonal.DOWN) return SiamPiece.LIGHT_DOWN;
            return SiamPiece.LIGHT_LEFT;
        } else {
            if (orientation === Orthogonal.UP) return SiamPiece.DARK_UP;
            if (orientation === Orthogonal.RIGHT) return SiamPiece.DARK_RIGHT;
            if (orientation === Orthogonal.DOWN) return SiamPiece.DARK_DOWN;
            return SiamPiece.DARK_LEFT;
        }
    }
    private constructor(public readonly value: number) {}

    public getDirection(): Orthogonal {
        return this.getOptionalDirection().get();
    }
    public toString(): string {
        switch (this.value) {
            case 0: return 'EMPTY';
            case 1: return 'LIGHT_UP';
            case 2: return 'LIGHT_RIGHT';
            case 3: return 'LIGHT_DOWN';
            case 4: return 'LIGHT_LEFT';
            case 5: return 'DARK_UP';
            case 6: return 'DARK_RIGHT';
            case 7: return 'DARK_DOWN';
            case 8: return 'DARK_LEFT';
            default:
                // must be 9, according to this.value's type
                Utils.expectToBe(this.value, 9);
                return 'MOUNTAIN';
        }
    }
}
