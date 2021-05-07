import { Joiner } from './ijoiner';

export class JoinerMocks {
    public static readonly INITIAL: Joiner =
        new Joiner([], 'creator', '', 'CREATOR', 0);

    public static readonly WITH_FIRST_CANDIDATE: Joiner =
        new Joiner(['firstCandidate'], 'creator', '', 'CREATOR', 0);

    public static readonly WITH_SECOND_CANDIDATE: Joiner =
        new Joiner(['firstCandidate', 'secondCandidate'], 'creator', '', 'CREATOR', 0);

    public static readonly WITH_CHOSEN_PLAYER: Joiner =
        new Joiner([], 'creator', 'firstCandidate', 'CREATOR', 1);

    public static readonly WITH_PROPOSED_CONFIG: Joiner =
        new Joiner([], 'creator', 'firstCandidate', 'CREATOR', 2, 10, 60);

    public static readonly WITH_ACCEPTED_CONFIG: Joiner =
        new Joiner([], 'creator', 'firstCandidate', 'CREATOR', 3, 10, 60);
}
