export class TablutCase {

    public static readonly UNOCCUPIED: TablutCase = new TablutCase(0);

    public static readonly PLAYER_ZERO_KING: TablutCase = new TablutCase(1);

    public static readonly PLAYER_ONE_KING: TablutCase = new TablutCase(2);

    public static readonly INVADERS: TablutCase = new TablutCase(3);

    public static readonly DEFENDERS: TablutCase = new TablutCase(4);

    private constructor(public readonly value: number) {
    }
}