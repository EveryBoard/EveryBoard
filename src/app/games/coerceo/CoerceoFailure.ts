export class CoerceoFailure {

    public static INVALID_DISTANCE: string = $localize`Your piece must land on one of the closest six triangles with the same color as the triangle on which the piece is.`;

    public static NOT_ENOUGH_TILES_TO_EXCHANGE: string = $localize`You do not have enough tiles to exchange in order to capture this piece. Pick one of your piece and move it.`;

    public static FIRST_CLICK_SHOULD_NOT_BE_NULL: string = $localize`Your first click must be on the piece that you want to move, or on a piece of your opponent that you want to exchange against two tiles.`;

    public static CANNOT_CAPTURE_FROM_REMOVED: string = $localize`You cannot capture on a removed tile.`;

    public static CANNOT_CAPTURE_FROM_EMPTY: string = $localize`You cannot capture from an empty space.`;

    public static CANNOT_CAPTURE_OWN_PIECES: string = $localize`You cannot capture your own pieces.`;
}
