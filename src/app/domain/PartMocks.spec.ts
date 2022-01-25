/* eslint-disable max-lines-per-function */
import firebase from 'firebase';
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

    public static readonly STARTING: Part = {
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
        beginning: firebase.firestore.FieldValue.serverTimestamp(),
    };
}
