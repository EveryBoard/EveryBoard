import { RulesConfig } from '../jscaip/RulesConfigUtil';

import { MinimalUser } from './MinimalUser';

// On top of these fields, a config room has a subcollection of candidates, which are MinimalUsers
export type ConfigRoom = {
    readonly creator: MinimalUser;
    readonly creatorElo: number;

    readonly chosenOpponent: MinimalUser | null;
    readonly status: Status;

    readonly firstPlayer: FirstPlayer;
    readonly gameType: GameType;
    readonly moveDuration: number;
    readonly gameDuration: number;
    readonly rulesConfig: RulesConfig;
    readonly gameName: string;
};

// A proposal is a subset of ConfigRoom with only the relevant fields. It is safer than a Partial<ConfigRoom>
export type ConfigProposal = {
    readonly gameType: GameType;
    readonly firstPlayer: FirstPlayer;
    readonly moveDuration: number;
    readonly gameDuration: number;
    readonly rulesConfig: RulesConfig;
}

export type FirstPlayer = 'Creator' | 'Random' | 'ChosenOpponent';

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace FirstPlayer {
    export const CREATOR: FirstPlayer = 'Creator';
    export const RANDOM: FirstPlayer = 'Random';
    export const CHOSEN_OPPONENT: FirstPlayer = 'ChosenOpponent';
}

export type GameType = 'Standard' | 'Blitz' | 'Custom';

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace GameType {
    export const STANDARD: GameType = 'Standard';
    export const BLITZ: GameType = 'Blitz';
    export const CUSTOM: GameType = 'Custom';
}

export namespace GameDuration {
    export const STANDARD_MOVE_DURATION: number = 2 * 60;
    export const STANDARD_GAME_DURATION: number = 30 * 60;
    export const BLITZ_MOVE_DURATION: number = 30;
    export const BLITZ_GAME_DURATION: number = 15 * 60;
}

export type Status = 'Created' | 'ConfigProposed' | 'Started' | 'Finished';

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace Status {
    // game created, no ChosenOpponent => waiting for acceptable candidate
    export const CREATED: Status = 'Created';
    // game created, ChosenOpponent selected, config proposed by the creator
    // => waiting the config room to accept them
    export const CONFIG_PROPOSED: Status = 'ConfigProposed';
    // gamecreated, ChosenOpponent selected, config proposed by the created, accepted by the config room
    // => game started
    export const STARTED: Status = 'Started';

    export const FINISHED: Status = 'Finished';

}
