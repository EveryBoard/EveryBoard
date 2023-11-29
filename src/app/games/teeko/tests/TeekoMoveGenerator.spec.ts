/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TeekoMove } from '../TeekoMove';
import { TeekoConfig, TeekoNode, TeekoRules } from '../TeekoRules';
import { TeekoState } from '../TeekoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { TeekoMoveGenerator } from '../TeekoMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;
const defaultConfig: MGPOptional<TeekoConfig> = TeekoRules.get().getDefaultRulesConfig();

describe('TeekoMoveGenerator', () => {

    let moveGenerator: TeekoMoveGenerator;

    beforeEach(() => {
        moveGenerator = new TeekoMoveGenerator();
    });
    it('should have all move options in drop phase', () => {
        // Given an initial node
        const initialState: TeekoState = TeekoRules.get().getInitialState();
        const node: TeekoNode = new TeekoNode(initialState, undefined, undefined, defaultConfig);

        // When listing the moves
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
        const node: TeekoNode = new TeekoNode(state, undefined, undefined, defaultConfig);

        // When listing the moves
        const moves: TeekoMove[] = moveGenerator.getListMoves(node);

        // Then there should be 8 moves (2 movable pieces, 8 valid targets in total)
        expect(moves.length).toBe(8);
    });
    it('should have all move options in translation phase with teleportation', () => {
        // Given a state in translation phase, with teleportation turned on
        const customConfig: TeekoConfig = {
            teleport: true,
        };
        const board: Table<PlayerOrNone> = [
            [O, X, _, _, _],
            [O, O, _, _, _],
            [X, X, _, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
        ];
        const state: TeekoState = new TeekoState(board, 8);
        const node: TeekoNode = new TeekoNode(state, undefined, undefined, MGPOptional.of(customConfig));

        // When listing the moves
        const moves: TeekoMove[] = moveGenerator.getListMoves(node);

        // Then there should be 4 x 17 (the number of piece x the number of empty space)
        expect(moves.length).toBe(4 * 17);
    });
});
