/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, PartStatus, PartType } from './Joiner';

export class JoinerMocks {
    public static readonly INITIAL: Joiner = {
        candidates: [],
        creator: 'creator',
        creatorId: 'creatorId',
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_FIRST_CANDIDATE: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        creatorId: 'creatorId',
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_SECOND_CANDIDATE: Joiner = {
        candidates: ['firstCandidate', 'secondCandidate'],
        creator: 'creator',
        creatorId: 'creatorId',
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_CHOSEN_PLAYER: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        creatorId: 'creatorId',
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_PROPOSED_CONFIG: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        creatorId: 'creatorId',
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_ACCEPTED_CONFIG: Joiner = {
        candidates: ['firstCandidate'],
        creator: 'creator',
        creatorId: 'creatorId',
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_STARTED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
}
