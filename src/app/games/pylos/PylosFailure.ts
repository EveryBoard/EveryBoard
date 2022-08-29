import { Localized } from 'src/app/utils/LocaleUtils';

export class PylosFailure {

    public static readonly MUST_MOVE_UPWARD: Localized = () => $localize`You must move your pieces upward.`;

    public static readonly SHOULD_HAVE_SUPPORTING_PIECES: Localized = () => $localize`Your piece must land on the board or on 4 other pieces.`;

    public static readonly CANNOT_MOVE_SUPPORTING_PIECE: Localized = () => $localize`You cannot move a supporting piece.`;

    public static readonly CANNOT_CAPTURE: Localized = () => $localize`You cannot capture.`;

    public static readonly INVALID_FIRST_CAPTURE: Localized = () => $localize`Your first capture is invalid.`;

    public static readonly INVALID_SECOND_CAPTURE: Localized = () => $localize`Your second capture is invalid.`;
}
