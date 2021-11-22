import { Localized } from 'src/app/utils/LocaleUtils';

export class DiamFailure {
    public static readonly NO_MORE_PIECES_OF_THIS_TYPE: Localized = () => $localize`You do not have any pieces of this type anymore.`;

    public static readonly STACK_IS_FULL: Localized = () => $localize`You cannot play here: this space is already full.`;

    public static readonly TARGET_STACK_TOO_HIGH: Localized = () => $localize`You cannot add more pieces to the target space, as it will contain more than 4 pieces.`;

    public static readonly MUST_SHIFT_LEFT_OR_RIGHT: Localized = () => $localize`To perform a shift, you must move the pieces to the space either directly to the left or directly to the right.`;

    public static readonly MUST_SELECT_PIECE_FIRST: Localized = () => $localize`You must first select either a piece from the side, or a stack of pieces to shift on the board.`;
}
