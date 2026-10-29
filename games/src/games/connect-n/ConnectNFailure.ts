import { Localized } from '../../utils/LocaleUtils';

export class ConnectNFailure {

    public static YOU_MUST_DROP_ONE_AT_FIRST_TURN: Localized = () => $localize`At your first turn, you must drop exactly one piece`;

    public static YOU_MUST_PLAY_EXACTLY_N_PIECES: (n: number) => string = (numberOfPiece: number) => $localize`You must drop exactly ${ numberOfPiece } pieces.`;

}
