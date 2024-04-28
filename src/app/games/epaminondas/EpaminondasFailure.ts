import { Localized } from 'src/app/utils/LocaleUtils';

export class EpaminondasFailure {

    public static readonly PHALANX_IS_LEAVING_BOARD: Localized = () => $localize`The move distance of your phalanx puts it out of the board.`;

    public static readonly SOMETHING_IN_PHALANX_WAY: Localized = () => $localize`There is something in the way of your phalanx.`;

    public static readonly PHALANX_SHOULD_BE_GREATER_TO_CAPTURE: Localized = () => $localize`Your phalanx must be bigger than the one you are capturing.`;

    public static readonly PHALANX_CANNOT_JUMP_FURTHER_THAN_ITS_SIZE: (stepSize: number, phalanxSize: number) => string = (s: number, p: number) => $localize`You took a phalanx of size ${ p } and moved it ${ s } steps. Phalanx cannot move further than their sizes.`;

    public static readonly SQUARE_NOT_ALIGNED_WITH_PHALANX: Localized = () => $localize`This square is not aligned with the direction of the phalanx.`;

    public static readonly PHALANX_CANNOT_CONTAIN_PIECES_OUTSIDE_BOARD: Localized = () => $localize`A phalanx can't contain pieces outside of the board.`;

    public static readonly PHALANX_CANNOT_CONTAIN_EMPTY_SQUARE: Localized = () => $localize`A phalanx cannot contain an empty square.`;

    public static readonly PHALANX_CANNOT_CONTAIN_OPPONENT_PIECE: Localized = () => $localize`A phalanx cannot contain a piece of the opponent.`;

}
