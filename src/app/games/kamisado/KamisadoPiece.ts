import { ComparableObject } from 'src/app/utils/Comparable';
import { KamisadoColor } from './KamisadoColor';
import { Player } from 'src/app/jscaip/Player';

type KamisadoPieceList = {
    ORANGE: KamisadoPiece,
    BLUE: KamisadoPiece,
    PURPLE: KamisadoPiece,
    PINK: KamisadoPiece,
    YELLOW: KamisadoPiece,
    RED: KamisadoPiece,
    GREEN: KamisadoPiece,
    BROWN: KamisadoPiece,
};

export class KamisadoPiece implements ComparableObject {
    private constructor(public readonly player: Player, public readonly color: KamisadoColor) {
    }
    public static readonly NONE: KamisadoPiece = new KamisadoPiece(Player.NONE, KamisadoColor.ANY);

    public static of(player: Player, value: number): KamisadoPiece {
        return new KamisadoPiece(player, KamisadoColor.of(value));
    }
    private static createPlayerColors(player: Player) {
        return {
            ORANGE: new KamisadoPiece(player, KamisadoColor.ORANGE),
            BLUE: new KamisadoPiece(player, KamisadoColor.BLUE),
            PURPLE: new KamisadoPiece(player, KamisadoColor.PURPLE),
            PINK: new KamisadoPiece(player, KamisadoColor.PINK),
            YELLOW: new KamisadoPiece(player, KamisadoColor.YELLOW),
            RED: new KamisadoPiece(player, KamisadoColor.RED),
            GREEN: new KamisadoPiece(player, KamisadoColor.GREEN),
            BROWN: new KamisadoPiece(player, KamisadoColor.BROWN),
        };
    }
    public static ZERO: KamisadoPieceList = KamisadoPiece.createPlayerColors(Player.ZERO);

    public static ONE: KamisadoPieceList = KamisadoPiece.createPlayerColors(Player.ONE);

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
