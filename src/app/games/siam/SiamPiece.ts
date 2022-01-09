import { Player } from 'src/app/jscaip/Player';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export type SiamPieceValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export class SiamPiece {

    public static readonly EMPTY: SiamPiece = new SiamPiece(0);

    public static readonly WHITE_UP: SiamPiece = new SiamPiece(1);

    public static readonly WHITE_RIGHT: SiamPiece = new SiamPiece(2);

    public static readonly WHITE_DOWN: SiamPiece = new SiamPiece(3);

    public static readonly WHITE_LEFT: SiamPiece = new SiamPiece(4);

    public static readonly BLACK_UP: SiamPiece = new SiamPiece(5);

    public static readonly BLACK_RIGHT: SiamPiece = new SiamPiece(6);

    public static readonly BLACK_DOWN: SiamPiece = new SiamPiece(7);

    public static readonly BLACK_LEFT: SiamPiece = new SiamPiece(8);

    public static readonly MOUNTAIN: SiamPiece = new SiamPiece(9);

    public static decode(value: SiamPieceValue): SiamPiece {
        switch (value) {
            case 0: return SiamPiece.EMPTY;
            case 1: return SiamPiece.WHITE_UP;
            case 2: return SiamPiece.WHITE_RIGHT;
            case 3: return SiamPiece.WHITE_DOWN;
            case 4: return SiamPiece.WHITE_LEFT;
            case 5: return SiamPiece.BLACK_UP;
            case 6: return SiamPiece.BLACK_RIGHT;
            case 7: return SiamPiece.BLACK_DOWN;
            case 8: return SiamPiece.BLACK_LEFT;
            case 9: return SiamPiece.MOUNTAIN;
        }
    }
    public belongTo(player: Player): boolean {
        if (player === Player.ZERO) {
            return (1 <= this.value && this.value <= 4);
        } else if (player === Player.ONE) {
            return (5 <= this.value && this.value <= 8);
        } else {
            return false;
        }
    }
    public isEmptyOrMountain(): boolean {
        return this.value === 0 || this.value === 9;
    }
    public isPiece(): boolean {
        return !this.isEmptyOrMountain();
    }
    public getOwner(): Player {
        if (1 <= this.value && this.value <= 4) return Player.ZERO;
        if (5 <= this.value && this.value <= 8) return Player.ONE;
        return Player.NONE;
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
        if (player === Player.NONE) throw new Error('Player None does not have any pieces.');
        if (player === Player.ZERO) {
            if (orientation === Orthogonal.UP) return SiamPiece.WHITE_UP;
            if (orientation === Orthogonal.RIGHT) return SiamPiece.WHITE_RIGHT;
            if (orientation === Orthogonal.DOWN) return SiamPiece.WHITE_DOWN;
            return SiamPiece.WHITE_LEFT;
        } else {
            if (orientation === Orthogonal.UP) return SiamPiece.BLACK_UP;
            if (orientation === Orthogonal.RIGHT) return SiamPiece.BLACK_RIGHT;
            if (orientation === Orthogonal.DOWN) return SiamPiece.BLACK_DOWN;
            return SiamPiece.BLACK_LEFT;
        }
    }
    private constructor(public readonly value: number) {}

    public getDirection(): Orthogonal {
        return this.getOptionalDirection().get();
    }
    public toString(): string {
        switch (this.value) {
            case 0: return 'EMPTY';
            case 1: return 'WHITE_UP';
            case 2: return 'WHITE_RIGHT';
            case 3: return 'WHITE_DOWN';
            case 4: return 'WHITE_LEFT';
            case 5: return 'BLACK_UP';
            case 6: return 'BLACK_RIGHT';
            case 7: return 'BLACK_DOWN';
            case 8: return 'BLACK_LEFT';
            default:
                // must be 9, according to this.value's type
                Utils.expectToBe(this.value, 9);
                return 'MOUNTAIN';
        }
    }
}
