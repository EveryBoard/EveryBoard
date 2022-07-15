import { Localized } from 'src/app/utils/LocaleUtils';

export class LinesOfActionFailure {

    public static readonly INVALID_MOVE_LENGTH: Localized = () => $localize`Your move should have a length equal to the number of pieces that exist on the same line.`;

    public static readonly CANNOT_JUMP_OVER_OPPONENT: Localized = () => $localize`You cannot jump over the opponent's pieces.`;

    public static readonly PIECE_CANNOT_MOVE: Localized = () => $localize`This piece has no possible move, select another one.`;

    public static readonly INVALID_DIRECTION: Localized = () => $localize`A move must be orthogonal or diagonal.`;
}
