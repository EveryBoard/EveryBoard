/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, MinimalUser, PartStatus, PartType } from './Joiner';

export class JoinerMocks {
    public static readonly CREATOR: MinimalUser = {
        name: 'creator',
        id: 'creatorId',
    }
    public static readonly INITIAL: Joiner = {
        candidates: [],
        creator: JoinerMocks.CREATOR,
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_FIRST_CANDIDATE: Joiner = {
        candidates: ['firstCandidate'],
        creator: JoinerMocks.CREATOR,
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_SECOND_CANDIDATE: Joiner = {
        candidates: ['firstCandidate', 'secondCandidate'],
        creator: JoinerMocks.CREATOR,
        chosenPlayer: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_CHOSEN_PLAYER: Joiner = {
        candidates: ['firstCandidate'],
        creator: JoinerMocks.CREATOR,
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_PROPOSED_CONFIG: Joiner = {
        candidates: ['firstCandidate'],
        creator: JoinerMocks.CREATOR,
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_ACCEPTED_CONFIG: Joiner = {
        candidates: ['firstCandidate'],
        creator: JoinerMocks.CREATOR,
        chosenPlayer: 'firstCandidate',
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_STARTED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
}
