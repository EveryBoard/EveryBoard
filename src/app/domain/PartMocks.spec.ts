/* eslint-disable max-lines-per-function */
import { serverTimestamp } from 'firebase/firestore';
import { MGPResult, Part } from './Part';
import { UserMocks } from './UserMocks.spec';

export class PartMocks {
    public static readonly INITIAL: Part = {
        lastUpdate: {
            index: 0,
            player: 0,
        },
        typeGame: 'Quarto',
        playerZero: UserMocks.CREATOR_MINIMAL_USER,
        turn: -1,
        result: MGPResult.UNACHIEVED.value,
        listMoves: [],
    };

    public static readonly STARTING: Part = {
        lastUpdate: {
            index: 1,
            player: 1,
        },
        typeGame: 'Quarto',
        playerZero: UserMocks.CREATOR_MINIMAL_USER,
        turn: 0,
        listMoves: [],
        result: MGPResult.UNACHIEVED.value,
        playerOne: UserMocks.OPPONENT_MINIMAL_USER,
        remainingMsForOne: 1800 * 1000,
        remainingMsForZero: 1800 * 1000,
        beginning: serverTimestamp(),
    };
}
