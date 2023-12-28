import { Localized } from 'src/app/utils/LocaleUtils';

export class MartianChessFailure {

    public static readonly MUST_CHOOSE_PIECE_FROM_YOUR_TERRITORY: Localized = () => $localize`You must pick a piece from your side of the board in order to move it.`;

    public static readonly CANNOT_CAPTURE_YOUR_OWN_PIECE_NOR_PROMOTE_IT: Localized = () => $localize`This is not a valid promotion nor a valid capture.`;

    public static readonly CANNOT_UNDO_LAST_MOVE: Localized = () => $localize`You cannot perform a move that is the reverse of the previous one.`;
}
