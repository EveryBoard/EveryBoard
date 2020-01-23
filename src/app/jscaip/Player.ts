export class Player {

    public static readonly ZERO = new Player(0);

    public static readonly ONE = new Player(1);

    public static readonly NONE = new Player(2);

    private constructor(public readonly value: number) {}
}