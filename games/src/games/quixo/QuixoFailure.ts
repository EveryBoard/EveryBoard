import { Localized } from '../../utils/LocaleUtils';

export abstract class QuixoFailure {

    public static readonly NO_INSIDE_CLICK: Localized = () => $localize`You must pick a space from the edge of the board.`;
}
