/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TeekoMinimax } from '../TeekoMinimax';
import { TeekoMove } from '../TeekoMove';
import { TeekoNode } from '../TeekoRules';
import { TeekoState } from '../TeekoState';
import { Table } from 'src/app/utils/ArrayUtils';

describe('TeekoMinimax', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let minimax: TeekoMinimax;

    beforeEach(() => {
        minimax = new TeekoMinimax();
    });
    it('should have all move options in drop phase', () => {
        // Given an initial node
        const initialState: TeekoState = TeekoState.getInitialState();
        const node: TeekoNode = new TeekoNode(initialState);

        // When computing the list of moves
        const moves: TeekoMove[] = minimax.getListMoves(node);

        // Then there should be (TeekoState.WIDTH * TeekoState.WIDTH) move, one by space
        expect(moves.length).toBe(TeekoState.WIDTH * TeekoState.WIDTH);
    });
    it('should have all move options in translation phase', () => {
        // Given an node in translation phase
        const board: Table<PlayerOrNone> = [
            [O, X, _, _, _],
            [O, O, _, _, _],
            [X, X, _, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
        ];
        const state: TeekoState = new TeekoState(board, 8);
        const node: TeekoNode = new TeekoNode(state);

        // When computing the list of moves
        const moves: TeekoMove[] = minimax.getListMoves(node);

        // Then there should be 4 x 17 (the number of piece x the number of empty space)
        expect(moves.length).toBe(4 * 17);
    });
    describe('getBoardValue', () => {
        it('should count the number of possible squares and lines', () => {
            // Given any board with only piece of Player.ZERO
            const board: Table<PlayerOrNone> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, O, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: TeekoState = new TeekoState(board, 6);
            const node: TeekoNode = new TeekoNode(state);

            // When calculating the board value
            const boardValue: number = minimax.getBoardValue(node).value;

            // Then it should be the negative number of possible victories for Player.ZERO
            expect(boardValue).toBe(-12);
        });
    });
});
