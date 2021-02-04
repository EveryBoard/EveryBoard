export class RelativePlayer {

    public static readonly NONE: RelativePlayer = new RelativePlayer('NONE');

    public static readonly ENNEMY: RelativePlayer = new RelativePlayer('ENNEMY');

    public static readonly PLAYER: RelativePlayer = new RelativePlayer('PLAYER');

    private constructor(public readonly value: string) {}
}