import { Localized } from 'src/app/utils/LocaleUtils';
import { GipfFailure } from '../gipf/GipfFailure';

export class YinshFailure {

    public static readonly PLACEMENT_AFTER_INITIAL_PHASE: Localized = () => $localize`You cannot put a new ring after the tenth turn.`;

    public static readonly NO_MARKERS_IN_INITIAL_PHASE: Localized = () => $localize`You cannot put a marker in a ring before placing all of your rings.`;

    public static readonly MISSING_CAPTURES: Localized = GipfFailure.MISSING_CAPTURES;

    public static readonly MOVE_DIRECTION_INVALID: Localized = () => $localize`The direction of your move is invalid: a move is made along a straight line.`;

    public static readonly CAN_ONLY_CAPTURE_YOUR_MARKERS: Localized = () => $localize`You can only capture your own markers.`;

    public static readonly SHOULD_SELECT_PLAYER_RING: Localized = () => $localize`You must pick one of your own rings to move.`;

    public static readonly SHOULD_END_MOVE_ON_EMPTY_SPACE: Localized = () => $localize`Your ring must land on an empty space.`;

    public static readonly MOVE_SHOULD_NOT_PASS_ABOVE_RING: Localized = () => $localize`A ring can only jump over markers or empty spaces, not over another ring.`;

    public static readonly MOVE_SHOULD_END_AT_FIRST_EMPTY_SPACE_AFTER_MARKERS: Localized = () => $localize`Your ring must land on the first empty space after a group of markers.`;

    public static readonly AMBIGUOUS_CAPTURE_COORD: Localized = GipfFailure.AMBIGUOUS_CAPTURE_COORD;

    public static readonly CAPTURE_SHOULD_TAKE_RING: Localized = () => $localize`When you capture markers, you must take one of your ring as well by clicking on it.`;

}
