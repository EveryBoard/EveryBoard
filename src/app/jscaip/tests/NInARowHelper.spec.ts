import { Utils } from '@everyboard/lib';
import { NInARowHelper } from '../NInARowHelper';
import { PlayerOrNone } from '../Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { BoardValue } from '../AI/BoardValue';
import { GameStatus } from '../GameStatus';
import { PlayerOrNoneGameStateWithTable } from '../state/PlayerOrNoneGameStateWithTable';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

class AbstractState extends PlayerOrNoneGameStateWithTable {}

describe('N In A Row Helper', () => {

    it('should count exactly one victory', () => {
        // Given a helper
        const helper: NInARowHelper<PlayerOrNone> = new NInARowHelper(Utils.identity, 4);

        // When asking it the board value of a board with a victory
        const board: Table<PlayerOrNone> = [
            [_, O, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [X, X, X, X],
        ];
        const state: AbstractState = new AbstractState(board, 0);
        const boardValue: BoardValue = helper.getBoardValue(state);

        // Then the value should be victory for player 1
        expect(boardValue).toEqual(GameStatus.ONE_WON.toBoardValue());
    });

});
