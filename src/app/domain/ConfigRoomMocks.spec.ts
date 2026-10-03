/* eslint-disable max-lines-per-function */
import { RulesConfig } from '@everyboard/games';

import { FirstPlayer, ConfigRoom, Status, GameType, GameDuration } from './ConfigRoom';
import { UserMocks } from './UserMocks.spec';

export class ConfigRoomMocks {

    public static getInitial(rulesConfig: RulesConfig): ConfigRoom {
        return {
            creator: UserMocks.CREATOR_MINIMAL_USER,
            creatorElo: 0,

            chosenOpponent: null,
            chosenOpponentElo: null,
            status: Status.CREATED,

            // We don't want the first player to be random here, to minimize non-deterministic tests
            firstPlayer: FirstPlayer.CREATOR,
            gameType: GameType.STANDARD,
            moveDuration: GameDuration.STANDARD_MOVE_DURATION,
            gameDuration: GameDuration.STANDARD_GAME_DURATION,
            rulesConfig: rulesConfig,
            gameName: 'P4',
        };
    }

    public static getInitialRandom(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            firstPlayer: FirstPlayer.RANDOM,
        };
    }

    public static withChosenOpponent(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        };
    }

    public static withAnotherChosenOpponent(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
        };
    }

    public static withProposedConfig(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
            status: Status.CONFIG_PROPOSED,
        };
    }

    public static withAcceptedConfig(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
            status: Status.STARTED,
        };
    }

}
