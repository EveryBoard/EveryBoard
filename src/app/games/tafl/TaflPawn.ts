import { Player } from 'src/app/jscaip/Player';

export class TaflPawn {

    public static readonly UNOCCUPIED: TaflPawn = new TaflPawn(Player.NONE, false);

    public static readonly PLAYER_ONE_KING: TaflPawn = new TaflPawn(Player.ONE, true);

    public static readonly INVADERS: TaflPawn = new TaflPawn(Player.ZERO, false);

    public static readonly DEFENDERS: TaflPawn = new TaflPawn(Player.ONE, false);

    private constructor(private readonly owner: Player,
                        private readonly king: boolean) {
    }
    public isKing(): boolean {
        return this.king;
    }
    public getOwner(): Player {
        return this.owner;
    }
}
