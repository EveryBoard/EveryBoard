import { MGPResult, Part } from './icurrentpart';

export class PartMocks {
    public static readonly INITIAL: Part = new Part({
        typeGame: 'Quarto',
        playerZero: 'creator',
        turn: -1,
        result: MGPResult.UNACHIEVED.value,
        listMoves: [],
    });

    public static readonly STARTING: Part = new Part({
        typeGame: 'Quarto',
        playerZero: 'creator',
        turn: 0,
        listMoves: [],
        result: MGPResult.UNACHIEVED.value,
        playerOne: 'firstCandidate',
        beginning: 1235,
    });
}
