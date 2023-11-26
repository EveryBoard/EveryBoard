/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TeekoMove } from '../TeekoMove';
import { TeekoNode, TeekoRules } from '../TeekoRules';
import { TeekoState } from '../TeekoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { TeekoMoveGenerator } from '../TeekoMoveGenerator';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('TeekoMoveGenerator', () => {

    let moveGenerator: TeekoMoveGenerator;

    beforeEach(() => {
        moveGenerator = new TeekoMoveGenerator();
    });
    it('should have all move options in drop phase', () => {
        // Given an initial node
        const initialState: TeekoState = TeekoRules.get().getInitialState();
        const node: TeekoNode = new TeekoNode(initialState);

        // When computing the list of moves
        const moves: TeekoMove[] = moveGenerator.getListMoves(node);

        // Then there should be (TeekoState.WIDTH * TeekoState.WIDTH) move, one by space
        expect(moves.length).toBe(TeekoState.WIDTH * TeekoState.WIDTH);
    });
    it('should have all move options in translation phase', () => {
        // Given a state in translation phase
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
        const moves: TeekoMove[] = moveGenerator.getListMoves(node);

        // Then there should be 8 moves (2 movable pieces, 8 valid targets in total)
        expect(moves.length).toBe(8);
    });
    it('should have all move options in translation phase with teleportation', () => {
        // Given a state in translation phase, with teleportation turned on
        const board: Table<PlayerOrNone> = [
            [O, X, _, _, _],
            [O, O, _, _, _],
            [X, X, _, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
        ];
        const state: TeekoState = new TeekoState(board, 8);
        const node: TeekoNode = new TeekoNode(state);
        TeekoRules.CAN_TELEPORT = true;

        // When computing the list of moves
        const moves: TeekoMove[] = moveGenerator.getListMoves(node);

        // Then there should be 4 x 17 (the number of piece x the number of empty space)
        expect(moves.length).toBe(4 * 17);
        TeekoRules.CAN_TELEPORT = false;
    });
});
