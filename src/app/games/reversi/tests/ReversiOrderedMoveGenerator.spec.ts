/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiNode } from '../ReversiRules';
import { Table } from 'src/app/jscaip/TableUtils';
import { ReversiOrderedMoveGenerator } from '../ReversiOrderedMoveGenerator';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('ReversiOrderedMoveGenerator', () => {

    let moveGenerator: ReversiOrderedMoveGenerator;

    beforeEach(() => {
        moveGenerator = new ReversiOrderedMoveGenerator();
    });

    it('should propose moves on the corner first', () => {
        // Given a board where zero can play on a corner
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, O, _, _],
            [_, _, _, _, _, O, _, _],
            [_, _, _, _, X, O, X, _],
        ];
        const state: ReversiState = new ReversiState(board, 2);
        const node: ReversiNode = new ReversiNode(state);
        // When generating the moves
        const moves: ReversiMove[] = moveGenerator.getListMoves(node);
        // Then it should contain the move in the corner first
        expect(moves.length).toBe(2);
        expect(moves[0]).toEqual(new ReversiMove(ReversiState.BOARD_WIDTH-1, ReversiState.BOARD_HEIGHT-1));
    });
});
