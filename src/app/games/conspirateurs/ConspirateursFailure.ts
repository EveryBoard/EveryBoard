import { Localized } from 'src/app/utils/LocaleUtils';

export class ConspirateursFailure {
    public static SIMPLE_MOVE_SHOULD_BE_OF_ONE_STEP: Localized = () => $localize`Your piece should land on a neighboring square.`;

    public static CANNOT_DROP_WHEN_OUT_OF_PIECE: Localized = () => $localize`You cannot drop a piece during the moving phase.`;

    public static CANNOT_MOVE_BEFORE_DROPPING_ALL_PIECES: Localized = () => $localize`You cannot move a piece before both players have dropped all of their pieces.`;

    public static MUST_JUMP_OVER_PIECES: Localized = () => $localize`A jump must be made over a piece, not over an empty square.`;

    public static MUST_DROP_IN_CENTRAL_ZONE: Localized = () => $localize`A drop must occur in the central zone of the board.`;

    public static INVALID_JUMP: Localized = () => $localize`A jump must land two squares from its original position, and be done in a straight line in any direction.`;

    public static SAME_LOCATION_VISITED_IN_JUMP: Localized = () => $localize`You are visiting the same location twice in a move, you are not allowed to do so.`;
}
