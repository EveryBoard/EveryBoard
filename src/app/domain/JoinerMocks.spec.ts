/* eslint-disable max-lines-per-function */
import { FirstPlayer, Joiner, PartStatus, PartType } from './Joiner';
import { UserMocks } from './UserMocks.spec';

export class JoinerMocks {

    public static readonly INITIAL: Joiner = {
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: null,
        firstPlayer: FirstPlayer.RANDOM.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
    };

    public static readonly WITH_CHOSEN_OPPONENT: Joiner = {
        ...JoinerMocks.INITIAL,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
    };

    public static readonly WITH_ANOTHER_CHOSEN_OPPONENT: Joiner = {
        ...JoinerMocks.INITIAL,
        chosenOpponent: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
    };
    public static readonly WITH_PROPOSED_CONFIG: Joiner = {
        ...JoinerMocks.INITIAL,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
    };
    public static readonly WITH_ACCEPTED_CONFIG: Joiner = {
        ...JoinerMocks.INITIAL,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        partStatus: PartStatus.PART_STARTED.value,
    };
}
