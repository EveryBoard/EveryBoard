export class GoFailure {

    public static readonly ILLEGAL_KO: string = $localize`Ce mouvement est un ko, vous devez jouer ailleurs avant de pouvoir rejouer dans cette case`;

    public static readonly CANNOT_PASS_AFTER_PASSED_PHASE: string = $localize`We are not in playing nor in passed phase, you must mark stone as dead or alive or accept current board.`;

    public static readonly CANNOT_ACCEPT_BEFORE_COUNTING_PHASE: string = $localize`Not countig or not accept.`;

    public static readonly OCCUPIED_CASE: string = $localize`illegal ecrasement`;

    public static readonly CANNOT_COMMIT_SUICIDE: string = $localize`You cannot commit suicide.`;
}
