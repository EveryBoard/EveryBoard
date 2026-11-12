import { RulesConfig } from '@everyboard/games';

import { FirstPlayer, ConfigRoom, Status, GameType, GameDuration } from './ConfigRoom';
import { PlayerInfo } from './PlayerInfo';
import { UserMocks } from './UserMocks.spec';

export type ConfigRoomWithOpponent = ConfigRoom & {
    readonly chosenOpponent: PlayerInfo;
};

export class ConfigRoomMocks {

    public static getInitial(rulesConfig: RulesConfig): ConfigRoom {
        return {
            creator: { user: UserMocks.CREATOR_MINIMAL_USER, elo: 0, botIdentifier: null },

            chosenOpponent: null,
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
            chosenOpponent: { user: UserMocks.OPPONENT_MINIMAL_USER, elo: 0, botIdentifier: null },
        };
    }

    public static withAnotherChosenOpponent(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: { user: UserMocks.OTHER_OPPONENT_MINIMAL_USER, elo: 0, botIdentifier: null },
        };
    }

    public static withProposedConfig(rulesConfig: RulesConfig): ConfigRoom {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: { user: UserMocks.OPPONENT_MINIMAL_USER, elo: 0, botIdentifier: null },
            status: Status.CONFIG_PROPOSED,
        };
    }

    public static withAcceptedConfig(rulesConfig: RulesConfig): ConfigRoomWithOpponent {
        return {
            ...ConfigRoomMocks.getInitial(rulesConfig),
            chosenOpponent: { user: UserMocks.OPPONENT_MINIMAL_USER, elo: 0, botIdentifier: null },
            status: Status.STARTED,
        };
    }

}
