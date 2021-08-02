export class GoFailure {

    public static readonly ILLEGAL_KO: string = $localize`This move is a ko, you must play somewhere else before you can play in this square again.`;

    public static readonly CANNOT_PASS_AFTER_PASSED_PHASE: string = $localize`We are not in playing nor in passed phase, you must mark stone as dead or alive or accept current board.`;

    public static readonly CANNOT_ACCEPT_BEFORE_COUNTING_PHASE: string = $localize`Not countig or not accept.`;

    public static readonly OCCUPIED_CASE: string = $localize`This square is already occupied.`;

    public static readonly CANNOT_COMMIT_SUICIDE: string = $localize`You cannot commit suicide.`;
}
