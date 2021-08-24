export class GipfFailure {

    public static readonly CAPTURE_MUST_BE_ALIGNED: string = $localize`You can only capture when 4 or more of your pieces are aligned, and it is not the case.`;

    public static readonly INVALID_CAPTURED_PIECES: string = $localize`You must select a valid capture that contains 4 pieces or more.`;

    public static readonly MISSING_CAPTURES: string = $localize`There are still possible captures to be done.`;

    public static readonly PLACEMENT_NOT_ON_BORDER: string = $localize`Pieces must be inserted in spaces on the edge of the board.`;

    public static readonly INVALID_PLACEMENT_DIRECTION: string = $localize`You must select a valid placement direction.`;

    public static readonly PLACEMENT_WITHOUT_DIRECTION: string = $localize`You must select a placement with a direction alongside the insertion space.`;

    public static readonly PLACEMENT_ON_COMPLETE_LINE: string = $localize`You cannot place a piece on a complete line.`;

    public static readonly AMBIGUOUS_CAPTURE_COORD: string = $localize`This piece belongs to two captures. Please select another piece in the capture you'd like to make.`;

    public static readonly NOT_PART_OF_CAPTURE: string = $localize`You must pick a capture.`;

    public static readonly CLICK_FURTHER_THAN_ONE_COORD: string = $localize`You must click on an arrow to select your destination.`;

    public static readonly NO_DIRECTIONS_AVAILABLE: string = $localize`You cannot insert a piece here, as all lines are full. Select another space.`;
}
