export class PylosFailure {
    public static readonly MUST_MOVE_UPWARD: string = $localize`You must move your pieces upward.`;

    public static readonly SHOULD_START_FROM_PLAYER_PIECE: string = $localize`move does not start from a player piece`;

    public static readonly SHOULD_HAVE_SUPPORTING_PIECES: string = $localize`move does not have supported pieces`;

    public static readonly CANNOT_LAND: string = $localize`landing coord is not landable`;

    public static readonly CANNOT_CAPTURE: string = $localize`cannot capture`;

    public static readonly INVALID_FIRST_CAPTURE: string = $localize`first capture is not valid`;

    public static readonly INVALID_SECOND_CAPTURE: string = $localize`second capture is not valid`;

    private constructor() {}
}
