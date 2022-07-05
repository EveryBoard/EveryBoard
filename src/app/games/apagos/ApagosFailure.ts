import { Localized } from 'src/app/utils/LocaleUtils';

export class ApagosFailure {

    public static readonly PIECE_SHOULD_MOVE_DOWNWARD: Localized = () => $localize`Pieces should only move downward!`;

    public static readonly CANNOT_LAND_ON_A_FULL_SQUARE: Localized = () => $localize`That square is already full, you cannot put a piece in it!`;

    public static readonly NO_PIECE_OF_YOU_IN_CHOSEN_SQUARE: Localized = () => $localize`You have no pieces in that square, select one that contains at least one of your pieces!`;

    public static readonly NO_PIECE_REMAINING_TO_DROP: Localized = () => $localize`There are no remaining pieces of that color to drop!`;

    public static readonly NO_POSSIBLE_TRANSFER_REMAINS: Localized = () => $localize`There is no possible transfer from that square!`;
}
