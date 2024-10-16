import { Localized } from 'src/app/utils/LocaleUtils';

export class CheckersFailure {

    public static readonly CANNOT_GO_BACKWARD: Localized = () => $localize`You cannot go backward with normal pieces!`;

    public static readonly CANNOT_SKIP_CAPTURE: Localized = () => $localize`You must capture when it is possible!`;

    public static readonly MUST_FINISH_CAPTURING: Localized = () => $localize`You must finish this capture!`;

    public static readonly THIS_PIECE_CANNOT_MOVE: Localized = () => $localize`This piece cannot move!`;

    public static readonly CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL: Localized = () => $localize`A capture should be a double diagonal step. Look at the green indicators to help you!`;

    public static readonly NORMAL_PIECES_CANNOT_MOVE_LIKE_THIS: Localized = () => $localize`NORMAL_PIECES_CANNOT_MOVE_LIKE_THIS`;

    public static readonly NORMAL_PIECES_CANNOT_CAPTURE_LIKE_THIS: Localized = () => $localize`NORMAL_PIECES_CANNOT_CAPTURE_LIKE_THIS`;

    public static readonly NO_PIECE_CAN_FLY: Localized = () => $localize`NO_PIECE_CAN_FLY`;

    public static readonly CANNOT_DO_ORTHOGONAL_MOVE: Localized = () => $localize`CANNOT_DO_ORTHOGONAL_CAPTURE`;

    public static readonly CANNOT_CAPTURE_TWICE_THE_SAME_COORD: Localized = () => $localize`You cannot jump over the same square several times!`;

    public static readonly MUST_DO_BIGGEST_CAPTURE: Localized = () => $localize`You must do the biggest capture possible`;

    public static readonly CANNOT_JUMP_OVER_SEVERAL_PIECES: Localized = () => $localize`CANNOT_JUMP_OVER_SEVERAL_PIECES`;

}
