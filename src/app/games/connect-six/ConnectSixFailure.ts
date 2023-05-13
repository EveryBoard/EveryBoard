import { Localized } from 'src/app/utils/LocaleUtils';

export class ConnectSixFailure {

    public static readonly FIRST_COORD_IS_OUT_OF_RANGE: Localized = () => $localize`First coord is out of range`;

    public static readonly SECOND_COORD_IS_OUT_OF_RANGE: Localized = () => $localize`First coord is out of range`;

    public static readonly COORDS_SHOULD_BE_DIFFERENT: Localized = () => $localize`Two coords should be different`;

    public static readonly MUST_DROP_EXACTLY_ONE_PIECE_AT_FIRST_TURN: Localized = () => $localize`You must drop exactly one piece at first turns`;

    public static readonly MUST_DROP_TWO_PIECES: Localized = () => $localize`You must drop two pieces!`;
}
