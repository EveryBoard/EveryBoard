import { Localized } from 'src/app/utils/LocaleUtils';

export class TaflFailure {

    public static readonly LANDING_ON_OCCUPIED_CASE: Localized = () => $localize`You cannot land on an occupied square.`;

    public static readonly THRONE_IS_LEFT_FOR_GOOD: Localized = () => $localize`Once you left the central throne, you cannot return to it.`;

    public static readonly SOLDIERS_CANNOT_SIT_ON_THRONE: Localized = () => $localize`Soldiers cannot sit on the throne.`;

    public static readonly SOMETHING_IN_THE_WAY: Localized = () => $localize`Something is in the way.`;
}
