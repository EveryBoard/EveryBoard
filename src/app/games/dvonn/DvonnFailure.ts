export class DvonnFailure {

    public static readonly INVALID_COORD: string = $localize`Invalid coordinate, please select a piece on the board.`;

    public static readonly NOT_PLAYER_PIECE: string = $localize`You must select a piece or a stack of your color.`;

    public static readonly EMPTY_STACK: string = $localize`You must select a non-empty stack.`;

    public static readonly TOO_MANY_NEIGHBORS: string = $localize`This stack cannot be moved because all 6 of its neighbors are not empty. You must select a stack with strictly less than 6 neighbors.`;

    public static readonly CANT_REACH_TARGET: string = $localize`This piece cannot move because its move would never end on another piece.`;

    public static readonly INVALID_MOVE_LENGTH: string = $localize`The length of the move must be equal to the size of the stack.`;

    public static readonly EMPTY_TARGET_STACK: string = $localize`The move must end on an occupied case.`;
}
