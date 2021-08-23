export class EncapsuleFailure {

    public static readonly PIECE_OUT_OF_STOCK: string = $localize`You do not have pieces of this type anymore.`;

    public static readonly INVALID_PLACEMENT: string = $localize`You must put your piece on an empty square or on a smaller piece.`;

    public static readonly NOT_DROPPABLE: string = $localize`You must pick your piece among the remaining ones.`;

    public static readonly INVALID_PIECE_SELECTED: string = $localize`You must pick one of your remaining piece or one piece on the board that is the biggest of its square.`;

    public static readonly SAME_DEST_AS_ORIGIN: string = $localize`You must select a different landing square than the square where the move originates from.`;

    public static readonly END_YOUR_MOVE: string = $localize`You are performing a move, you must select a landing square.`;
}
