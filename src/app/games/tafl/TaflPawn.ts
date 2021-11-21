export class TaflPawn {

    public static readonly UNOCCUPIED: TaflPawn = new TaflPawn(0);

    public static readonly PLAYER_ZERO_KING: TaflPawn = new TaflPawn(1);

    public static readonly PLAYER_ONE_KING: TaflPawn = new TaflPawn(2);

    public static readonly INVADERS: TaflPawn = new TaflPawn(3);

    public static readonly DEFENDERS: TaflPawn = new TaflPawn(4);

    private constructor(public readonly value: number) {
    }
    public isKing(): boolean {
        return this === TaflPawn.PLAYER_ZERO_KING ||
               this === TaflPawn.PLAYER_ONE_KING;
    }
}
