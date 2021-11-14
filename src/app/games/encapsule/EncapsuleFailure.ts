import { Localized } from 'src/app/utils/LocaleUtils';

export class EncapsuleFailure {

    public static readonly PIECE_OUT_OF_STOCK: Localized = () => $localize`You do not have pieces of this type anymore.`;

    public static readonly INVALID_PLACEMENT: Localized = () => $localize`You must put your piece on an empty square or on a smaller piece.`;

    public static readonly NOT_DROPPABLE: Localized = () => $localize`You must pick your piece among the remaining ones.`;

    public static readonly INVALID_PIECE_SELECTED: Localized = () => $localize`You must pick one of your remaining pieces or one piece on the board that is the biggest of its square.`;

    public static readonly SAME_DEST_AS_ORIGIN: Localized = () => $localize`You must select a different landing square than the square where the move originates from.`;

    public static readonly END_YOUR_MOVE: Localized = () => $localize`You are performing a move, you must select a landing square.`;
}
