import { Localized } from 'src/app/utils/LocaleUtils';

export class ReversiFailure {

    public static readonly NO_ELEMENT_SWITCHED: Localized = () => $localize`Your move should switch at least one piece.`;
}
