import { Localized } from 'src/app/utils/LocaleUtils';

export class SaharaFailure {

    public static readonly CAN_ONLY_REBOUND_ON_BLACK: Localized = () => $localize`You can only rebound on dark spaces.`;

    public static readonly CAN_ONLY_REBOUND_ON_EMPTY_SPACE: Localized = () => $localize`You can only rebound on empty spaces.`;

    public static readonly MUST_CHOOSE_PYRAMID_FIRST: Localized = () => $localize`You must pick one of your pyramids first.`;

    public static readonly MUST_CHOOSE_OWN_PYRAMID: Localized = () => $localize`You must pick one of your pyramids.`;

    public static readonly THOSE_TWO_SPACES_ARE_NOT_NEIGHBORS: Localized = () => $localize`Those two spaces are not neighbors.`;

    public static readonly THOSE_TWO_SPACES_HAVE_NO_COMMON_NEIGHBOR: Localized = () => $localize`Those two spaces have no intermediary neighbor.`;
}
