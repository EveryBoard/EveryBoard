/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { HexagonalConnectionDrops, HexagonalConnectionMove } from '../HexagonalConnectionMove';
import { HexagonalConnectionNode, HexagonalConnectionRules } from '../HexagonalConnectionRules';
import { HexagonalConnectionState } from '../HexagonalConnectionState';
import { Table } from 'src/app/jscaip/TableUtils';
import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI/AI';
import { HexagonalConnectionAlignmentMinimax } from '../HexagonalConnectionAlignmentMinimax';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('HexagonalConnectionAlignmentMinimax', () => {

    let minimax: Minimax<HexagonalConnectionMove, HexagonalConnectionState>;
    const level1: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };
    const level2: AIDepthLimitOptions = { name: 'Level 2', maxDepth: 2 };
    const defaultConfig: NoConfig = HexagonalConnectionRules.get().getDefaultRulesConfig();

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;

    beforeEach(() => {
        minimax = new HexagonalConnectionAlignmentMinimax();
    });

    it('should do winning move when one is possible', () => {
        // Given a board where there is place for a victory of first player
        const board: Table<FourStatePiece> = [
            [O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: HexagonalConnectionState = new HexagonalConnectionState(board, 2);
        const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);

        // When asking what is the best move
        const bestMove: HexagonalConnectionMove = minimax.chooseNextMove(node, level1, defaultConfig);

        // Then it should be that victory
        expect(bestMove).toEqual(HexagonalConnectionDrops.of(new Coord(4, 0), new Coord(5, 0)));
    });

    it('should block double-open fives at level two', () => {
        // Given a minimax at level two
        // And a board where current opponent could win if current player does not block them (..XXXXX..)
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: HexagonalConnectionState = new HexagonalConnectionState(board, 3);
        const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);

        // When asking what is the best move
        const bestMove: HexagonalConnectionMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        expect(bestMove).toEqual(HexagonalConnectionDrops.of(new Coord(1, 18), new Coord(7, 18)));
    });

    it('should block double-open four at level two', () => {
        // Given a minimax at level two
        // And an board where current opponent could win if current player does not block them (..XXXX..)
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: HexagonalConnectionState = new HexagonalConnectionState(board, 3);
        const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);

        // When asking what is the best move
        const bestMove: HexagonalConnectionMove = minimax.chooseNextMove(node, level2, defaultConfig);

        // Then the minimax level two should block
        expect(bestMove).toEqual(HexagonalConnectionDrops.of(new Coord(1, 18), new Coord(6, 18)));
    });

});
