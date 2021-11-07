export class ApagosFailure {

    public static readonly PIECE_SHOULD_MOVE_DOWNWARD: () => string = () => $localize`Pieces should only move downward!`;

    public static readonly CANNOT_LAND_ON_A_FULL_SQUARE: () => string = () => $localize`That square is already full, you cannot put a piece in it!`;

    public static readonly NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE: () => string = () => $localize`You have no remaining piece in that square, select one that contains at least one of your pieces!`;

    public static readonly NO_PIECE_REMAINING_TO_DROP: () => string = () => $localize`There are no remaining piece of that color to drop!`;

    public static readonly MUST_END_MOVE_BY_DROP: () => string = () => $localize`Move must end by clicking an arrow (either to drop or to finish a transfer)!`;
}
