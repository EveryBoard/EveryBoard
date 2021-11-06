import { Localized } from 'src/app/utils/LocaleUtils';

export class DiamFailure {
    public static readonly NO_MORE_PIECES_OF_THIS_TYPE: Localized = () => $localize`You do not have anymore pieces of this type.`;

    public static readonly STACK_IS_FULL: Localized = () => $localize`You cannot play here: this stack of pieces is already full.`;

    public static readonly TARGET_STACK_TOO_HIGH: Localized = () => $localize`You cannot add more pieces to the target stack, as it will contain more than 4 pieces`;
}
