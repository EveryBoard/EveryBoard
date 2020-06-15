import { Joiner } from "./ijoiner"

export class JoinerMocks {
    
    public static readonly JOINER_INITIAL: Joiner = new Joiner([], 'creator', '', '0', 0);

    public static readonly JOINER_WITH_FIRST_CANDIDATE: Joiner = new Joiner(['firstCandidate'], 'creator', '', '0', 0);

    public static readonly JOINER_WITH_SECOND_CANDIDATE: Joiner = new Joiner(['firstCandidate', 'secondCandidate'], 'creator', '', '0', 0);

    public static readonly JOINER_WITH_CHOSEN_PLAYER: Joiner = new Joiner([], 'creator', 'firstCandidate', '0', 1);

    public static readonly JOINER_WITH_PROPOSED_CONFIG: Joiner = new Joiner([], 'creator', 'firstCandidate', '0', 2, 10, 60);

    public static readonly JOINER_WITH_ACCEPTED_CONFIG: Joiner = new Joiner([], 'creator', 'firstCandidate', '0', 3, 10, 60);
}