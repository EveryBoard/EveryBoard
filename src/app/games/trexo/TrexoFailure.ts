import { Localized } from 'src/app/utils/LocaleUtils';

export class TrexoFailure {

    public static readonly NON_NEIGHBORING_SPACES: Localized = () => $localize`Those two spaces are not neighbors!`;

    public static readonly NO_WAY_TO_DROP_IT_HERE: Localized = () => $localize`There is no way to put a piece there!`;

    public static readonly CANNOT_DROP_ON_ONLY_ONE_PIECE: Localized = () => $localize`You cannot drop on only one piece!`;

    public static readonly CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS: Localized = () => $localize`You cannot drop a piece on uneven grounds!`;
}
