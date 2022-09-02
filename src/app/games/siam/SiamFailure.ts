import { Localized } from 'src/app/utils/LocaleUtils';

export abstract class SiamFailure {

    public static readonly CANNOT_INSERT_WHEN_SELECTED: Localized = () => $localize`You cannot insert a piece when you have already selected a piece.`;

    public static readonly NO_REMAINING_PIECE_TO_INSERT: Localized = () => $localize`You cannot insert a piece, all your pieces are already on the board.`;

    public static readonly NOT_ENOUGH_FORCE_TO_PUSH: Localized = () => $localize`You do not have enough strength to push.`;

    public static readonly ILLEGAL_ROTATION: Localized = () => $localize`You must move or rotate your piece.`;

    public static readonly ILLEGAL_PUSH: Localized = () => $localize`Your push is invalid: it is either not straight, is not pushing anything, or is leaving the board.`;

    public static readonly MUST_INSERT_OR_CHOOSE_YOUR_PIECE: Localized = () => $localize`You should insert or choose one of your pieces!`;
}
