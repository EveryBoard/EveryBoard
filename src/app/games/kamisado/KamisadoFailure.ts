import { Localized } from 'src/app/utils/LocaleUtils';

export class KamisadoFailure {

    public static readonly NOT_RIGHT_COLOR: Localized = () => $localize`This piece is not of the color you have to play.`;

    public static readonly END_CASE_NOT_EMPTY: Localized = () => $localize`You must move to an empty square.`;

    public static readonly DIRECTION_NOT_ALLOWED: Localized = () => $localize`You can only move forward, orthogonally or diagonally.`;

    public static readonly MOVE_BLOCKED: Localized = () => $localize`This move is blocked by another piece.`;

    public static readonly PLAY_WITH_SELECTED_PIECE: Localized = () => $localize`You must play with the selected piece.`;
}
