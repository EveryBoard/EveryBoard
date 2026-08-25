import { Localized } from '../../utils/LocaleUtils';

export class ConnectNFailure {

    public static FIRST_TURN_MEANS_ONE_MOVE: Localized = () => $localize`First turns must have exactly one drop`;

    public static YOU_MUST_PLAY_EXACTLY: (n: number) => string = (numberOfPiece: number) => $localize`You must drop exactly ${ numberOfPiece } pieces.`;

}