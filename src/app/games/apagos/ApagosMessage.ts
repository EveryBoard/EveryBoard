export class ApagosMessage {

    public static readonly PIECE_SHOULD_MOVE_DOWNWARD: () => string = () => 'Pieces should only move downward!';

    public static readonly CANNOT_LAND_ON_A_FULL_SQUARE: () => string = () => 'That square is already full, you cannot land on it!';

    public static readonly NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE: () => string = () => 'You have no remaining piece in that square, select one that contains at least one of your pieces!';

    public static readonly NO_PIECE_REMAINING_TO_DROP: () => string = () => 'There is no remaining piece of that color to drop!';

    public static readonly MUST_END_MOVE_BY_DROP: () => string = () => 'Move must end by a drop, please select an arrow to drop or to finish a transfer!';
}
