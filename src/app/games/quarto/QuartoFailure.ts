import { Localized } from 'src/app/utils/LocaleUtils';

export class QuartoFailure {

    public static readonly MUST_GIVE_A_PIECE: Localized = () => $localize`You must give a piece.`;

    public static readonly PIECE_ALREADY_ON_BOARD: Localized = () => $localize`That piece is already on the board.`;

    public static readonly CANNOT_GIVE_PIECE_IN_HAND: Localized = () => $localize`You cannot give the piece that was in your hands.`;
}
