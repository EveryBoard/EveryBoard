/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, PartStatus, PartType } from './Joiner';

export class JoinerMocks {
    public static readonly INITIAL: Joiner = {
        candidates: [],
        creator: 'creator',
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };

    public static readonly WITH_FIRST_CANDIDATE: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };

    public static readonly WITH_SECOND_CANDIDATE: Joiner = {
        candidates: ['firstCandidate', 'secondCandidate'],
        creator: 'creator',
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };

    public static readonly WITH_CHOSEN_PLAYER: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };

    public static readonly WITH_PROPOSED_CONFIG: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };

    public static readonly WITH_ACCEPTED_CONFIG: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_STARTED.value,
        maximalMoveDuration: 120,
        totalPartDuration: 1800,
    };
}
