import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { ArrayUtils } from "src/app/collectionlib/arrayutils/ArrayUtils";
import { Comparable } from "src/app/collectionlib/Comparable";
import { Player } from "src/app/jscaip/Player";

export class KamisadoColor implements Comparable {
    public static readonly ANY: KamisadoColor = new KamisadoColor(0, "any");
    public static readonly ORANGE: KamisadoColor = new KamisadoColor(1, "orange");
    public static readonly BLUE  : KamisadoColor = new KamisadoColor(2, "blue");
    public static readonly PURPLE: KamisadoColor = new KamisadoColor(3, "purple");
    public static readonly PINK  : KamisadoColor = new KamisadoColor(4, "pink");
    public static readonly YELLOW: KamisadoColor = new KamisadoColor(5, "yellow");
    public static readonly RED   : KamisadoColor = new KamisadoColor(6, "red");
    public static readonly GREEN : KamisadoColor = new KamisadoColor(7, "green");
    public static readonly BROWN : KamisadoColor = new KamisadoColor(8, "brown");

    public static of(value: number): KamisadoColor {
        switch (value) {
            case 0: return KamisadoColor.ANY;
            case 1: return KamisadoColor.ORANGE;
            case 2: return KamisadoColor.BLUE;
            case 3: return KamisadoColor.PURPLE;
            case 4: return KamisadoColor.PINK;
            case 5: return KamisadoColor.YELLOW;
            case 6: return KamisadoColor.RED;
            case 7: return KamisadoColor.GREEN;
            case 8: return KamisadoColor.BROWN;
            default: throw new Error("Invalid value " + value + " for EncapsulePiece")
        }
    }
    private constructor(public readonly value: number, public readonly name: string) {
    }
    public equals(color: KamisadoColor): boolean {
        return color.value === this.value;
    }
}


export class KamisadoPiece implements Comparable {
    private constructor (public readonly player: Player, public readonly color: KamisadoColor) {
    }
    public static readonly NONE: KamisadoPiece = new KamisadoPiece(Player.NONE, KamisadoColor.ANY);
    private static createPlayerColors(player: Player) {
        return class {
            public static of(value: number): KamisadoPiece {
                return new KamisadoPiece(player, KamisadoColor.of(value));
            }
            public static ORANGE: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.ORANGE);
            public static BLUE:   KamisadoPiece = new KamisadoPiece(player, KamisadoColor.BLUE);
            public static PURPLE: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.PURPLE);
            public static PINK:   KamisadoPiece = new KamisadoPiece(player, KamisadoColor.PINK);
            public static YELLOW: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.YELLOW);
            public static RED:    KamisadoPiece = new KamisadoPiece(player, KamisadoColor.RED);
            public static GREEN:  KamisadoPiece = new KamisadoPiece(player, KamisadoColor.GREEN);
            public static BROWN:  KamisadoPiece = new KamisadoPiece(player, KamisadoColor.BROWN);
        }
    }
    static ZERO = KamisadoPiece.createPlayerColors(Player.ZERO);
    static ONE = KamisadoPiece.createPlayerColors(Player.ONE);
    public static of(value: number): KamisadoPiece {
        const color = value % 16;
        const player = (value - color) / 16;
        return new KamisadoPiece(Player.of(player), KamisadoColor.of(color));
    }
    public getValue(): number {
        return (this.player.value * 16) + this.color.value;
    }
    public equals(piece: KamisadoPiece): boolean {
        return piece.player === this.player && piece.color === this.color;
    }
}

export class KamisadoBoard {
    public static SIZE: number = 8;
    public static COLORS: ReadonlyArray<ReadonlyArray<KamisadoColor>> = [
        [1, 2, 3, 4, 5, 6, 7, 8].map(KamisadoColor.of),
        [6, 1, 4, 7, 2, 5, 8, 3].map(KamisadoColor.of),
        [7, 4, 1, 6, 3, 8, 5, 2].map(KamisadoColor.of),
        [4, 3, 2, 1, 8, 5, 4, 3].map(KamisadoColor.of),
        [5, 6, 7, 8, 1, 2, 3, 4].map(KamisadoColor.of),
        [2, 5, 8, 3, 6, 1, 4, 7].map(KamisadoColor.of),
        [3, 8, 5, 2, 7, 4, 1, 6].map(KamisadoColor.of),
        [8, 7, 6, 5, 4, 3, 2, 1].map(KamisadoColor.of)
    ]
    public static getColorAt(x: number, y: number): KamisadoColor {
        return KamisadoBoard.COLORS[y][x];
    }
    public static getInitialBoard(): ReadonlyArray<ReadonlyArray<KamisadoPiece>> {
        const _ = KamisadoPiece.NONE;
        return [
            [1, 2, 3, 4, 5, 6, 7, 8].map(KamisadoPiece.ONE.of),
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [8, 7, 6, 5, 4, 3, 2, 1].map(KamisadoPiece.ZERO.of),
        ];
    }
    public static INITIAL: ReadonlyArray<ReadonlyArray<KamisadoPiece>> = KamisadoBoard.getInitialBoard();
}
export class KamisadoPartSlice extends GamePartSlice {
    public readonly colorToPlay: KamisadoColor;
    public constructor(turn: number, colorToPlay: KamisadoColor, board: ReadonlyArray<ReadonlyArray<number>>) {
        super(ArrayUtils.copyBiArray(board), turn);
        this.colorToPlay = colorToPlay;
    }
        
    // -1 indicates an empty cell
    // a positive number indicates that a player is there
    // if the number if >=16, it is a pawn of the second player, and his color is indicated by the number divided by 16
    // if the number is <16, it is a pawn of the first player, and his color is indicated by the number
    // the color numbers match the ones defined in COLORS_IN_BOARD

    public static EMPTY: number = -1;
    public static getStartingSlice(): KamisadoPartSlice {
        return new KamisadoPartSlice(0, KamisadoColor.ANY, ArrayUtils.mapBiArray(KamisadoBoard.INITIAL, p => p.getValue()));
    }

    public getPieceAt(x: number, y: number): KamisadoPiece {
        return KamisadoPiece.of(this.getBoardByXY(x, y));
    }
    public isEmptyAt(x: number, y: number): boolean {
        return this.getPieceAt(x, y).equals(KamisadoPiece.NONE);
    }
}