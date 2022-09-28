import { Localized } from 'src/app/utils/LocaleUtils';

export abstract class SiamFailure {

    public static readonly NO_REMAINING_PIECE_TO_INSERT: Localized = () => $localize`You cannot insert a piece, all your pieces are already on the board.`;

    public static readonly NOT_ENOUGH_FORCE_TO_PUSH: Localized = () => $localize`You do not have enough strength to push.`;

    public static readonly MUST_MOVE_OR_ROTATE: Localized = () => $localize`You must move or rotate your piece.`;

    public static readonly ILLEGAL_PUSH: Localized = () => $localize`Your push is invalid: it is either not straight, is not pushing anything, or is leaving the board.`;

    public static readonly MUST_SELECT_VALID_DESTINATION: Localized = () => $localize`You must select a valid destination (highlighted on the board) for your piece`;

    public static readonly MUST_SELECT_ORIENTATION: Localized = () => $localize`You should select the orientation of your piece by clicking on one of the arrows.`;
}
