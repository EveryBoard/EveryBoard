/* eslint-disable max-lines-per-function */
import { Game, GameResult } from './Game';
import { UserMocks } from './UserMocks.spec';

export class GameMocks {

    public static readonly STARTED: Game = {
        gameName: 'Quarto',
        playerZero: UserMocks.CREATOR_MINIMAL_USER,
        playerZeroElo: 0,
        result: GameResult.IN_PROGRESS,
        playerOne: UserMocks.OPPONENT_MINIMAL_USER,
        playerOneElo: 0,
        beginning: 0,
    };

    public static readonly OTHER_STARTED: Game = {
        gameName: 'Quarto',
        playerZero: UserMocks.OTHER_CREATOR_MINIMAL_USER,
        playerZeroElo: 0,
        result: GameResult.IN_PROGRESS,
        playerOne: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
        playerOneElo: 0,
        beginning: 0,
    };
}
