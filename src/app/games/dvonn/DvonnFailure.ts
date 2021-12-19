import { Localized } from 'src/app/utils/LocaleUtils';

export class DvonnFailure {

    public static readonly NOT_PLAYER_PIECE: Localized = () => $localize`You must select a piece or a stack of your color.`;

    public static readonly EMPTY_STACK: Localized = () => $localize`You must select a stack.`;

    public static readonly TOO_MANY_NEIGHBORS: Localized = () => $localize`This stack cannot be moved because all 6 of its neighbors are occupied. You must select a stack with strictly less than 6 neighbors.`;

    public static readonly CANT_REACH_TARGET: Localized = () => $localize`This stack cannot move because it could never land on another piece.`;

    public static readonly INVALID_MOVE_LENGTH: Localized = () => $localize`A stack must always be moved by as many spaces as there are pieces in the stack.`;

    public static readonly EMPTY_TARGET_STACK: Localized = () => $localize`The stack must land on an occupied space.`;
}
