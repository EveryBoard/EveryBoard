import { Joiner } from './ijoiner';

export class JoinerMocks {
    public static readonly INITIAL: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: '',
            firstPlayer: 'CREATOR',
            partStatus: 0,
        });

    public static readonly WITH_FIRST_CANDIDATE: Joiner =
        new Joiner({
            candidates: ['firstCandidate'],
            creator: 'creator',
            chosenPlayer: '',
            firstPlayer: 'CREATOR',
            partStatus: 0,
        });

    public static readonly WITH_SECOND_CANDIDATE: Joiner =
        new Joiner({
            candidates: ['firstCandidate', 'secondCandidate'],
            creator: 'creator',
            chosenPlayer: '',
            firstPlayer: 'CREATOR',
            partStatus: 0,
        });

    public static readonly WITH_CHOSEN_PLAYER: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: 'CREATOR',
            partStatus: 1,
        });

    public static readonly WITH_PROPOSED_CONFIG: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: 'CREATOR',
            partStatus: 2,
            maximalMoveDuration: 10,
            totalPartDuration: 60
        });

    public static readonly WITH_ACCEPTED_CONFIG: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: 'CREATOR',
            partStatus: 3,
            maximalMoveDuration: 10,
            totalPartDuration: 60,
        });
}
