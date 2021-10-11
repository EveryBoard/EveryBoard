import { Localized } from 'src/app/utils/LocaleUtils';

export class GoFailure {

    public static readonly ILLEGAL_KO: Localized = () => $localize`This move is a ko, you must play somewhere else before you can play in this intersection again.`;

    public static readonly CANNOT_PASS_AFTER_PASSED_PHASE: Localized = () => $localize`We are in the counting phase, you must mark stones as dead or alive or accept the current board by passing your turn.`;

    public static readonly CANNOT_ACCEPT_BEFORE_COUNTING_PHASE: Localized = () => $localize`You cannot accept before the counting phase.`;

    public static readonly OCCUPIED_INTERSECTION: Localized = () => $localize`This intersection is already occupied.`;

    public static readonly CANNOT_COMMIT_SUICIDE: Localized = () => $localize`You cannot commit suicide.`;
}
