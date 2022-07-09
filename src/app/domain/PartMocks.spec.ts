/* eslint-disable max-lines-per-function */
import { serverTimestamp } from 'firebase/firestore';
import { MGPResult, Part } from './Part';

export class PartMocks {

    public static readonly INITIAL: Part = {
        lastUpdate: {
            index: 0,
            player: 0,
        },
        typeGame: 'Quarto',
        playerZero: 'creator',
        turn: -1,
        result: MGPResult.UNACHIEVED.value,
        listMoves: [],
    };

    public static readonly ANOTHER_UNSTARTED: Part = {
        lastUpdate: {
            index: 0,
            player: 0,
        },
        typeGame: 'Quarto',
        playerZero: 'not_creator',
        turn: -1,
        result: MGPResult.UNACHIEVED.value,
        listMoves: [],
    };

    public static readonly STARTED: Part = {
        lastUpdate: {
            index: 1,
            player: 1,
        },
        typeGame: 'Quarto',
        playerZero: 'creator',
        turn: 0,
        listMoves: [],
        result: MGPResult.UNACHIEVED.value,
        playerOne: 'firstCandidate',
        remainingMsForOne: 1800 * 1000,
        remainingMsForZero: 1800 * 1000,
        beginning: serverTimestamp(),
    };

    public static readonly OTHER_STARTED: Part = {
        lastUpdate: {
            index: 1,
            player: 1,
        },
        typeGame: 'Quarto',
        playerZero: 'le_createur',
        turn: 0,
        listMoves: [],
        result: MGPResult.UNACHIEVED.value,
        playerOne: 'le_chosen_candidate',
        remainingMsForOne: 1800 * 1000,
        remainingMsForZero: 1800 * 1000,
        beginning: serverTimestamp(),
    };

    public static readonly ANOTHER_STARTED: Part = {
        lastUpdate: {
            index: 1,
            player: 1,
        },
        typeGame: 'Quarto',
        playerZero: 'le_createur',
        turn: 0,
        listMoves: [],
        result: MGPResult.UNACHIEVED.value,
        playerOne: 'le_chosen_candidate',
        remainingMsForOne: 1800 * 1000,
        remainingMsForZero: 1800 * 1000,
        beginning: serverTimestamp(),
    };
}
