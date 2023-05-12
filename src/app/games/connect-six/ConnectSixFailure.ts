import { Localized } from 'src/app/utils/LocaleUtils';

export class ConnectSixFailure {

    public static readonly FIRST_COORD_IS_OUT_OF_RANGE: Localized = () => $localize`First coord is out of range`;

    public static readonly SECOND_COORD_IS_OUT_OF_RANGE: Localized = () => $localize`First coord is out of range`;

    public static readonly CANNOT_DROP_TWO_PIECES_AT_FIRST_TURN: Localized = () => $localize`Cannot drop two pieces at first turns`;

    public static readonly MUST_DROP_TWO_PIECES: Localized = () => $localize`You must drop two pieces !`;
}
