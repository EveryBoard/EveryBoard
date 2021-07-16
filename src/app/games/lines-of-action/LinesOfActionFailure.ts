export class LinesOfActionFailure {

    public static readonly INVALID_MOVE_LENGTH: string = $localize`Your move should have a length equal to the number of pieces that exist on the same line.`;

    public static readonly CANNOT_JUMP_OVER_ENEMY: string = $localize`You cannot jump over the opponent's pieces.`;

    public static readonly NOT_YOUR_PIECE: string = $localize`You must select one of your pieces.`;

    public static readonly PIECE_CANNOT_MOVE: string = $localize`This piece has no possible move, select another one.`;

    public static readonly INVALID_DIRECTION: string = $localize`A move must be orthogonal or diagonal`;
}
