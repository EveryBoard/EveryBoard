import { FirstPlayer, Joiner, PartStatus } from './ijoiner';

export class JoinerMocks {
    public static readonly INITIAL: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: '',
            firstPlayer: FirstPlayer.CREATOR.value,
            partStatus: PartStatus.PART_CREATED.value,
        });

    public static readonly WITH_FIRST_CANDIDATE: Joiner =
        new Joiner({
            candidates: ['firstCandidate'],
            creator: 'creator',
            chosenPlayer: '',
            firstPlayer: FirstPlayer.CREATOR.value,
            partStatus: PartStatus.PART_CREATED.value,
        });

    public static readonly WITH_SECOND_CANDIDATE: Joiner =
        new Joiner({
            candidates: ['firstCandidate', 'secondCandidate'],
            creator: 'creator',
            chosenPlayer: '',
            firstPlayer: FirstPlayer.CREATOR.value,
            partStatus: PartStatus.PART_CREATED.value,
        });

    public static readonly WITH_CHOSEN_PLAYER: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: FirstPlayer.CREATOR.value,
            partStatus: PartStatus.PLAYER_CHOSEN.value,
        });

    public static readonly WITH_PROPOSED_CONFIG: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: FirstPlayer.CREATOR.value,
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            maximalMoveDuration: 10,
            totalPartDuration: 60,
        });

    public static readonly WITH_ACCEPTED_CONFIG: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: FirstPlayer.CREATOR.value,
            partStatus: PartStatus.PART_STARTED.value,
            maximalMoveDuration: 10,
            totalPartDuration: 60,
        });
}
