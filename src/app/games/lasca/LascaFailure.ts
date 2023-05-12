import { Localized } from 'src/app/utils/LocaleUtils';


export class LascaFailure {

    public static readonly CANNOT_GO_BACKWARD: Localized = () => $localize`You cannot go backward with normal pieces!`;

    public static readonly CANNOT_CAPTURE_EMPTY_SPACE: Localized = () => $localize`You cannot capture an empty square, nor jump over it!`;

    public static readonly CANNOT_SKIP_CAPTURE: Localized = () => $localize`You must capture when it is possible!`;

    public static readonly MUST_FINISH_CAPTURING: Localized = () => $localize`You must finish this capture!`;

    public static readonly THIS_PIECE_CANNOT_MOVE: Localized = () => $localize`This piece cannot move!`;

    public static readonly CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL: Localized = () => $localize`A capture should be a double diagonal step. Look at the green indicators to help you!`;

    public static readonly MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL: Localized = () => $localize`You must move in a single diagonal step!`;

    public static readonly CANNOT_CAPTURE_TWICE_THE_SAME_COORD: Localized = () => $localize`You cannot jump over the same square several times!`;
}
