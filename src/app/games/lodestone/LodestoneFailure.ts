import { Localized } from 'src/app/utils/LocaleUtils';

export class LodestoneFailure {

    public static MUST_FLIP_LODESTONE: Localized = () => $localize`You must flip your lodestone before putting it back on the board`;

    public static MUST_PLACE_CAPTURES_ON_PRESSURE_PLATES: Localized = () => $localize`As long as there are pressure plates, you must place all the pieces that you have captured on them, not more nor less.`

    public static TARGET_IS_CRUMBLED: Localized = () => $localize`You must place your lodestone on a non-crumbled square!`;

    public static TOO_MANY_CAPTURES_ON_SAME_PRESSURE_PLATE: Localized = () => $localize`You placed too many captures on the same pressure plate, which has not enough space left.`
}
