/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { RulesConfig } from '../jscaip/RulesConfigUtil';
import { FirstPlayer, ConfigRoom, Status, GameType, GameDuration } from './ConfigRoom';
import { UserMocks } from './UserMocks.spec';

export class ConfigRoomMocks {

    public static getInitial(rulesConfig: MGPOptional<RulesConfig>): ConfigRoom {
        return {
            creator: UserMocks.CREATOR_MINIMAL_USER,
            creatorElo: 0,

            chosenOpponent: null,
            status: Status.CREATED,

            // We don't want the first player to be random here, to minimize non-deterministic tests
            firstPlayer: FirstPlayer.CREATOR,
            gameType: GameType.STANDARD,
            moveDuration: GameDuration.STANDARD_MOVE_DURATION,
            gameDuration: GameDuration.STANDARD_GAME_DURATION,
            rulesConfig: rulesConfig.getOrElse({}),
            gameName: 'P4',
        };
    }

    public static getInitialRandom(rulesConfig: MGPOptional<RulesConfig>): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            firstPlayer: FirstPlayer.RANDOM,
        };
    }

    public static withChosenOpponent(rulesConfig: MGPOptional<RulesConfig>): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
        };
    }

    public static withAnotherChosenOpponent(rulesConfig: MGPOptional<RulesConfig>): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
        };
    }

    public static withProposedConfig(rulesConfig: MGPOptional<RulesConfig>): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
            status: Status.CONFIG_PROPOSED,
        };
    }

    public static withAcceptedConfig(rulesConfig: MGPOptional<RulesConfig>): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: UserMocks.OPPONENT_MINIMAL_USER,
            status: Status.STARTED,
        };
    }

}
