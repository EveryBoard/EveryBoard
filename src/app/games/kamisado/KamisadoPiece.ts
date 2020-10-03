import { Comparable } from "src/app/collectionlib/Comparable";
import { Player } from "src/app/jscaip/Player";
import { KamisadoColor } from "./KamisadoColor";

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
        if (value === undefined) {
            throw new Error("KamisadoPiece.of undefined!");
        }
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
    public isEmpty(): boolean {
        return this.equals(KamisadoPiece.NONE);
    }
}