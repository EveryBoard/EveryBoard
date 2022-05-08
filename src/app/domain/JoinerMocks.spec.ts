/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, PartStatus, PartType } from './Joiner';
import { UserMocks } from './UserMocks.spec';

export class JoinerMocks {

    public static readonly INITIAL: Joiner = {
        candidates: [],
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
    public static readonly WITH_FIRST_CANDIDATE: Joiner = {
        candidates: [UserMocks.OPPONENT_MINIMAL_USER],
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
    public static readonly WITH_SECOND_CANDIDATE: Joiner = {
        candidates: [
            UserMocks.OPPONENT_MINIMAL_USER,
            { id: 'secondCandidate-user-doc-id', name: 'secondCandidate' },
        ],
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
    public static readonly WITH_CHOSEN_OPPONENT: Joiner = {
        candidates: [UserMocks.OPPONENT_MINIMAL_USER],
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
    public static readonly WITH_PROPOSED_CONFIG: Joiner = {
        candidates: [UserMocks.OPPONENT_MINIMAL_USER],
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
    public static readonly WITH_ACCEPTED_CONFIG: Joiner = {
        candidates: [UserMocks.OPPONENT_MINIMAL_USER],
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_STARTED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };
}
