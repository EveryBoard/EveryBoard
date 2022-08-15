import { Localized } from 'src/app/utils/LocaleUtils';

export class LodestoneFailure {

    public static MUST_FLIP_LODESTONE: Localized = () => $localize`You must flip your lodestone before putting it back on the board.`;

    public static MUST_PLACE_CAPTURES_ON_PRESSURE_PLATES: Localized = () => $localize`As long as there are pressure plates, you must place all the pieces that you have captured on them.`;

    public static TARGET_IS_CRUMBLED: Localized = () => $localize`You must place your lodestone on a non-crumbled square!`;

    public static TOO_MANY_CAPTURES_ON_SAME_PRESSURE_PLATE: Localized = () => $localize`You placed too many captures on the same pressure plate, which has not enough space left.`;

    public static MUST_PLACE_CAPTURES: Localized = () => $localize`You must place your captures on the pressure plates, on the side of the board.`;

    public static NO_CAPTURES_TO_PLACE_YET: Localized = () => $localize`You cannot place any capture now, you must first place your lodestone on the board!`;

}
