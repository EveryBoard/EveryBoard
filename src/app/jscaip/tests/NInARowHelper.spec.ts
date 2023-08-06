import { Utils } from 'src/app/utils/utils';
import { NInARowHelper } from '../NInARowHelper';
import { Player, PlayerOrNone } from '../Player';
import { Coord } from '../Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { BoardValue } from '../BoardValue';
import { GameStateWithTable } from '../GameStateWithTable';
import { GameStatus } from '../GameStatus';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

class AbstractState extends GameStateWithTable<PlayerOrNone> {}

describe('N In A Row Helper', () => {

    function isInRange(coord: Coord): boolean {
        return coord.isInRange(4, 4);
    }
    describe('getBoardValue', () => {
        it('should count exactly one victory', () => {
            // Given a helper
            const helper: NInARowHelper<PlayerOrNone> = new NInARowHelper(isInRange, Utils.identity, 4);

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
});
