/* eslint-disable max-lines-per-function */
import { serverTimestamp } from 'firebase/firestore';
import { UserMocks } from './UserMocks.spec';
import { Game, GameResult } from './Part';

export class PartMocks {

    public static readonly STARTED: Game = {
        gameName: 'Quarto',
        playerZero: UserMocks.CREATOR_MINIMAL_USER,
        result: GameResult.IN_PROGRESS,
        playerOne: UserMocks.OPPONENT_MINIMAL_USER,
        beginning: 0,
    };

    public static readonly OTHER_STARTED: Game = {
        gameName: 'Quarto',
        playerZero: UserMocks.OTHER_CREATOR_MINIMAL_USER,
        result: GameResult.IN_PROGRESS,
        playerOne: UserMocks.OTHER_OPPONENT_MINIMAL_USER,
        beginning: 0,
    };

    public static readonly FINISHED: Game = {
        gameName: 'Quarto',
        playerZero: UserMocks.OPPONENT_MINIMAL_USER,
        playerOne: UserMocks.CREATOR_MINIMAL_USER,
        result: GameResult.VICTORY_OF_ONE,
        beginning: 0,
    };
}
