import { Player } from "src/app/jscaip/Player";

export class DvonnPiece {
    public static readonly SOURCE: DvonnPiece = new DvonnPiece(Player.NONE);
    public static readonly PLAYER_ZERO: DvonnPiece = new DvonnPiece(Player.ZERO);
    public static readonly PLAYER_ONE: DvonnPiece = new DvonnPiece(Player.ONE);
    // This is the maximal possible number returned by getValue.
    // TODO: this should be Player.MAX_VALUE
    public static readonly MAX_VALUE: number = 2;
    public static of(value: number): DvonnPiece {
        return new DvonnPiece(Player.of(value));
    }

    private constructor(public readonly player: Player) {
    }
    public getValue(): number {
        return this.player.value
    }
    public belongsTo(player: Player): boolean {
        return this.player === player;
    }
}
