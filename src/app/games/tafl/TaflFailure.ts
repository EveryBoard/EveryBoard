import { Localized } from 'src/app/utils/LocaleUtils';

export class TaflFailure {

    public static readonly LANDING_ON_OCCUPIED_SQUARE: Localized = () => $localize`You cannot land on an occupied square.`;

    public static readonly THRONE_IS_LEFT_FOR_GOOD: Localized = () => $localize`Once you left the central throne, you cannot return to it.`;

    public static readonly SOLDIERS_CANNOT_SIT_ON_THRONE: Localized = () => $localize`Soldiers cannot sit on the throne.`;

    public static readonly MOVE_MUST_BE_ORTHOGONAL: Localized = () => $localize`Tafl moves must be orthogonal.`;
}
