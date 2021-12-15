import { FirstPlayer, Joiner, PartStatus, PartType } from './ijoiner';

export class JoinerMocks {
    public static readonly INITIAL: Joiner =
        new Joiner({
            candidates: [],
            creator: 'creator',
            chosenPlayer: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
        });

    public static readonly WITH_FIRST_CANDIDATE: Joiner =
        new Joiner({
            candidates: ['firstCandidate'],
            creator: 'creator',
            chosenPlayer: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
        });

    public static readonly WITH_SECOND_CANDIDATE: Joiner =
        new Joiner({
            candidates: ['firstCandidate', 'secondCandidate'],
            creator: 'creator',
            chosenPlayer: null,
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
        });

    public static readonly WITH_CHOSEN_PLAYER: Joiner =
        new Joiner({
            candidates: ['firstCandidate'],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_CREATED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
        });

    public static readonly WITH_PROPOSED_CONFIG: Joiner =
        new Joiner({
            candidates: ['firstCandidate'],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.CONFIG_PROPOSED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
        });

    public static readonly WITH_ACCEPTED_CONFIG: Joiner =
        new Joiner({
            candidates: ['firstCandidate'],
            creator: 'creator',
            chosenPlayer: 'firstCandidate',
            firstPlayer: FirstPlayer.RANDOM.value,
            partType: PartType.STANDARD.value,
            partStatus: PartStatus.PART_STARTED.value,
            maximalMoveDuration: 120,
            totalPartDuration: 1800,
        });
}
