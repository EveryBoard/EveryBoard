import { GipfFailure } from '../gipf/GipfFailure';

export class YinshFailure {
    public static readonly PLACEMENT_AFTER_INITIAL_PHASE: string = $localize`You cannot put a new ring after the tenth turn.`;

    public static readonly NO_MARKERS_IN_INITIAL_PHASE: string = $localize`You cannot put a marker in a ring before placing all of your rings.`;

    public static readonly MISSING_CAPTURES: string = GipfFailure.MISSING_CAPTURES;

    public static readonly CAPTURE_MUST_BE_ALIGNED: string = GipfFailure.CAPTURE_MUST_BE_ALIGNED;

    public static readonly INVALID_CAPTURED_PIECES: string = $localize`Please pick a valid capture that contains exactly 5 markers.`;

    public static readonly CAN_ONLY_CAPTURE_YOUR_MARKERS: string = $localize`You can only capture your own markers.`;

    public static readonly HOLES_IN_CAPTURE: string = $localize`Captured markers must follow each other without holes, your capture contains a hole.`;

    public static readonly SHOULD_SELECT_PLAYER_RING: string = $localize`You must pick one of your own rings to move.`;

    public static readonly SHOULD_END_MOVE_ON_EMPTY_CASE: string = $localize`Your ring must land on an empty space.`;

    public static readonly MOVE_SHOULD_NOT_PASS_ABOVE_RING: string = $localize`A ring can only jump over markers or empty spaces, not over another ring.`;

    public static readonly MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS: string = $localize`Your ring must land on the first empty space after a group of markers.`;

    public static readonly AMBIGUOUS_CAPTURE_COORD: string = GipfFailure.AMBIGUOUS_CAPTURE_COORD;

    public static readonly NOT_PART_OF_CAPTURE: string = GipfFailure.NOT_PART_OF_CAPTURE;

    public static readonly INVALID_CAPTURE: string = $localize`A capture must contain exactly 5 markers.`;

    public static readonly CAPTURE_SHOULD_TAKE_RING: string = $localize`When you capture markers, you must take one of your ring as well by clicking on it.`;

}
