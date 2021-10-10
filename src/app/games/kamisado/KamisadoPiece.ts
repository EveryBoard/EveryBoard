import { ComparableObject } from 'src/app/utils/Comparable';
import { KamisadoColor } from './KamisadoColor';
import { Player } from 'src/app/jscaip/Player';

export class KamisadoPiece implements ComparableObject {
    private constructor(public readonly player: Player, public readonly color: KamisadoColor) {
    }
    public static readonly NONE: KamisadoPiece = new KamisadoPiece(Player.NONE, KamisadoColor.ANY);

    private static createPlayerColors(player: Player) {
        return class {
            public static of(value: number): KamisadoPiece {
                return new KamisadoPiece(player, KamisadoColor.of(value));
            }
            public static ORANGE: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.ORANGE);
            public static BLUE: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.BLUE);
            public static PURPLE: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.PURPLE);
            public static PINK: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.PINK);
            public static YELLOW: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.YELLOW);
            public static RED: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.RED);
            public static GREEN: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.GREEN);
            public static BROWN: KamisadoPiece = new KamisadoPiece(player, KamisadoColor.BROWN);
        };
    }
    public static ZERO = KamisadoPiece.createPlayerColors(Player.ZERO);

    public static ONE = KamisadoPiece.createPlayerColors(Player.ONE);

    public equals(piece: KamisadoPiece): boolean {
        return piece.player === this.player && piece.color === this.color;
    }
    public isEmpty(): boolean {
        return this.player.equals(Player.NONE);
    }
    public belongsTo(player: Player): boolean {
        return this.player === player;
    }
}
