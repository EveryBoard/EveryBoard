/* eslint-disable max-lines-per-function */
import { FirstPlayer, ConfigRoom, PartStatus, PartType } from './ConfigRoom';
import { UserMocks } from './UserMocks.spec';

export class ConfigRoomMocks {

    public static readonly INITIAL: ConfigRoom = {
        creator: UserMocks.CREATOR_MINIMAL_USER,
        chosenOpponent: null,
        // We don't want the first player to be random here, to minimize non-deterministic tests
        firstPlayer: FirstPlayer.CREATOR.value,
        partType: PartType.STANDARD.value,
        partStatus: PartStatus.PART_CREATED.value,
        maximalMoveDuration: PartType.NORMAL_MOVE_DURATION,
        totalPartDuration: PartType.NORMAL_PART_DURATION,
        gameConfig: {},
    };

    public static readonly INITIAL_RANDOM: ConfigRoom = {
        ...ConfigRoomMocks.INITIAL,
        firstPlayer: FirstPlayer.RANDOM.value,
    };

    public static readonly WITH_CHOSEN_OPPONENT: ConfigRoom = {
        ...ConfigRoomMocks.INITIAL,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
    };

    public static readonly WITH_ANOTHER_CHOSEN_OPPONENT: ConfigRoom = {
        ...ConfigRoomMocks.INITIAL,
        chosenOpponent: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
    };
    public static readonly WITH_PROPOSED_CONFIG: ConfigRoom = {
        ...ConfigRoomMocks.INITIAL,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        partStatus: PartStatus.CONFIG_PROPOSED.value,
    };
    public static readonly WITH_ACCEPTED_CONFIG: ConfigRoom = {
        ...ConfigRoomMocks.INITIAL,
        chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        partStatus: PartStatus.PART_STARTED.value,
    };
}
