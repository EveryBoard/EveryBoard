export class GoFailure {
    public static readonly CANNOT_PASS_AFTER_PASSED_PHASE: string = $localize`We are not in playing nor in passed phase, you must mark stone as dead or alive or accept current board.`;

    public static readonly CANNOT_ACCEPT_BEFORE_COUNTING_PHRASE: string = $localize`Not countig or not accept.`;

    public static readonly OCCUPIED_CASE: string = $localize`illegal ecrasement`;

    public static readonly CANNOT_PERFORM_KO: string = $localize`illegal ko`;

    public static readonly CANNOT_COMMIT_SUICIDE: string = $localize`You cannot commit suicide.`;

    private constructor() {}
}
