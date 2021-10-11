import { Localized } from 'src/app/utils/LocaleUtils';

export class PentagoFailure {

    public static readonly CANNOT_ROTATE_NEUTRAL_BLOCK: Localized = () => $localize`If the quadrant to turn is neutral, please just use move without rotation.`;

    public static readonly MUST_CHOOSE_BLOCK_TO_ROTATE: Localized = () => $localize`No quadrant is neutral, you must pick a quadrant to rotate.`;
}
