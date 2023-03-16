import { Coord } from 'src/app/jscaip/Coord';
import { Localized } from 'src/app/utils/LocaleUtils';

export class TrexoFailure {

    public static readonly NON_NEIGHBORING_SPACES: Localized = () => $localize`Thoses two spaces are not neighbors!`;

    public static readonly NO_WAY_TO_DROP_IT_HERE: Localized = () => $localize`There is no way to put a piece there!`;

    public static readonly OUT_OF_RANGE_COORD: (c: Coord) => string = (c: Coord) => $localize`${ c.toString() } is out of the board!`;

    public static readonly CANNOT_DROP_ON_ONLY_ONE_PIECE: Localized = () => $localize`You cannot drop on only one piece!`;

    public static readonly CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS: Localized = () => $localize`You cannot drop piece on uneven grounds!`;

    // Genre ça .... On va vraiment i18ner ça ?
    public static readonly INVALID_DIMENSIONS: Localized = () => $localize`Invalid board dimensions`;
}
