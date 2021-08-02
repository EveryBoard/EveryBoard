export abstract class SiamFailure {

    public static readonly NO_REMAINING_PIECE_TO_INSERT: string = $localize`You cannot insert a piece, all your pieces are already on the board.`;

    public static readonly NOT_ENOUGH_FORCE_TO_PUSH: string = $localize`You do not have enough strength to push.`;

    public static readonly ILLEGAL_ROTATION: string = $localize`You cannot push and turn at the same time.`;

    public static readonly ILLEGAL_PUSH: string = $localize`Your push is invalid: it is either not straight, is not pushing anything, or is leaving the board.`;
}
