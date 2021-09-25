import { Player } from 'src/app/jscaip/Player';
import { Orthogonal } from 'src/app/jscaip/Direction';

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

    public static decode(value: number): SiamPiece {
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
            default: throw new Error('Unknown value for SiamPiece(' + value + ').');
        }
    }
    public belongTo(player: Player): boolean {
        if (player == null) throw new Error('Player must be set (even if Player.NONE).');
        if (player === Player.ZERO) {
            return (1 <= this.value && this.value <= 4);
        } else if (player === Player.ONE) {
            return (5 <= this.value && this.value <= 8);
        } else {
            return false;
        }
    }
    public static isEmptyOrMountain(value: number): boolean {
        return [0, 9].includes(value);
    }
    public static getOwner(value: number): Player {
        if (1 <= value && value <= 4) return Player.ZERO;
        if (5 <= value && value <= 8) return Player.ONE;
        throw new Error('Player.NONE do not own piece.');
    }
    public static getNullableDirection(value: number): Orthogonal {
        switch (value) {
            case 0: return null;
            case 1: return Orthogonal.UP;
            case 5: return Orthogonal.UP;
            case 2: return Orthogonal.RIGHT;
            case 6: return Orthogonal.RIGHT;
            case 3: return Orthogonal.DOWN;
            case 7: return Orthogonal.DOWN;
            case 4: return Orthogonal.LEFT;
            case 8: return Orthogonal.LEFT;
            case 9: return null;
        }
    }
    public static getDirection(value: number): Orthogonal {
        const direction: Orthogonal = SiamPiece.getNullableDirection(value);
        if (direction == null) throw new Error('Piece ' + value + ' has no direction.');
        return direction;
    }
    public static of(orientation: Orthogonal, player: Player): SiamPiece {
        if (orientation == null) throw new Error('Orientation must be set.');
        if (player == null) throw new Error('Player must be set.');
        if (player === Player.NONE) throw new Error(`Player None don't have any pieces.`);
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
        return SiamPiece.getDirection(this.value);
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
            case 9: return 'MOUNTAIN';
        }
    }
}
