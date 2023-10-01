import { Localized } from 'src/app/utils/LocaleUtils';

export class DiaballikFailure {

    public static CANNOT_MOVE_WITH_BALL: Localized = () => $localize`You cannot move the piece holding the ball.`;

    public static MUST_MOVE_BY_ONE_ORTHOGONAL_SPACE: Localized = () => $localize`You must move by exactly one orthogonal space.`;

    public static PASS_PATH_OBSTRUCTED: Localized = () => $localize`The path of this pass is obstructed.`;

    public static PASS_MUST_BE_IN_STRAIGHT_LINE: Localized = () => $localize`A pass must be done in a straight line, orthogonally or diagonally.`;

    public static CAN_ONLY_DO_ONE_PASS: Localized = () => $localize`You can only perform one pass per turn.`;

    public static CAN_ONLY_TRANSLATE_TWICE: Localized = () => $localize`You can only perform two translations per turn, not three.`;
}
