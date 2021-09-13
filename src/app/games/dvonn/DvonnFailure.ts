export class DvonnFailure {

    public static readonly INVALID_COORD: string = $localize`Invalid coordinate, please select a piece on the board.`;

    public static readonly NOT_PLAYER_PIECE: string = $localize`You must select a piece or a stack of your color.`;

    public static readonly EMPTY_STACK: string = $localize`You must select a stack.`;

    public static readonly TOO_MANY_NEIGHBORS: string = $localize`This stack cannot be moved because all 6 of its neighbors are occupied. You must select a stack with strictly less than 6 neighbors.`;

    public static readonly CANT_REACH_TARGET: string = $localize`This stack cannot move because it could never land on another piece.`;

    public static readonly INVALID_MOVE_LENGTH: string = $localize`A stack must always be moved by as many spaces as there are pieces in the stack.`;

    public static readonly EMPTY_TARGET_STACK: string = $localize`The stack must land on an occupied space.`;
}
