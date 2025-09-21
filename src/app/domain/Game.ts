import { JSONValue } from '@everyboard/lib';
import { MinimalUser } from './MinimalUser';

export type Game = {
    readonly gameName: string; // the type of game
    readonly playerZero: MinimalUser; // the first player
    readonly playerOne: MinimalUser; // the second player
    readonly beginning: number; // beginning of the game as a timestamp
    readonly result: GameResult;
}

export type GameEventBase = {
    readonly eventType: string;
    readonly time: number;
    readonly user: MinimalUser;
}

export type GameEventMove = GameEventBase & {
    readonly eventType: 'Move';
    readonly move: JSONValue;
}

// The StartGame action is a dummy action to ensure that at least one event occurs at game start.
// This is required because the clock logic relies on at least one event happening at the start of the game.
// The Sync action is another dummy action to ensure that we when we're in sync with the server
export type Action = 'AddMoveTime' | 'AddGameTime' | 'StartGame' | 'EndGame' | 'Sync';

export type GameEventAction = GameEventBase & {
    readonly eventType: 'Action';
    readonly action: Action;
}

export type RequestType = 'Draw' | 'Rematch' | 'TakeBack';

export type GameEventRequest = GameEventBase & {
    readonly eventType: 'Request';
    readonly requestType: RequestType;
}

export type GameEventReply = GameEventBase & {
    readonly eventType: 'Reply';
    readonly accept: boolean;
    readonly requestType: RequestType;
    readonly data?: JSONValue;
}

export type GameEvent = GameEventReply | GameEventRequest | GameEventAction | GameEventMove;

export type GameResult = 'InProgress'
    | 'ResignOfZero' | 'ResignOfOne' | 'VictoryOfZero' | 'VictoryOfOne' | 'TimeoutOfZero' | 'TimeoutOfOne'
    | 'HardDraw' | 'AgreedDrawByZero' | 'AgreedDrawByOne'

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace GameResult {
    export const IN_PROGRESS: GameResult = 'InProgress';
    export const RESIGN_OF_ZERO: GameResult = 'ResignOfZero';
    export const RESIGN_OF_ONE: GameResult = 'ResignOfOne';
    export const VICTORY_OF_ZERO: GameResult = 'VictoryOfZero';
    export const VICTORY_OF_ONE: GameResult = 'VictoryOfOne';
    export const TIMEOUT_OF_ZERO: GameResult = 'TimeoutOfZero';
    export const TIMEOUT_OF_ONE: GameResult = 'TimeoutOfOne';
    export const HARD_DRAW: GameResult = 'HardDraw';
    export const AGREED_DRAW_BY_ZERO: GameResult = 'AgreedDrawByZero';
    export const AGREED_DRAW_BY_ONE: GameResult = 'AgreedDrawByOne';
}
