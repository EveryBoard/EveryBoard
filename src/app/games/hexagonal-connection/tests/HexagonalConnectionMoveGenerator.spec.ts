/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { Coord } from 'src/app/jscaip/Coord';
import { HexagonalConnectionMove } from '../HexagonalConnectionMove';
import { HexagonalConnectionConfig, HexagonalConnectionNode, HexagonalConnectionRules } from '../HexagonalConnectionRules';
import { HexagonalConnectionState } from '../HexagonalConnectionState';
import { Table } from 'src/app/jscaip/TableUtils';
import { HexagonalConnectionMoveGenerator } from '../HexagonalConnectionMoveGenerator';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

fdescribe('HexagonalConnectionMoveGenerator', () => {

    let moveGenerator: HexagonalConnectionMoveGenerator;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const O: FourStatePiece = FourStatePiece.ZERO;

    const defaultConfig: MGPOptional<HexagonalConnectionConfig> =
        HexagonalConnectionRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new HexagonalConnectionMoveGenerator();
    });

    it('should propose only one move at first turns', () => {
        // Given the initial node
        const state: HexagonalConnectionState = HexagonalConnectionRules.get().getInitialState(defaultConfig);
        const size: number = state.getWidth();
        const node: HexagonalConnectionNode = new HexagonalConnectionNode(state);

        // When listing the moves
        const moves: HexagonalConnectionMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should only include the center of the board
        const cx: number = Math.floor(size / 2);
        const cy: number = Math.floor(size / 2);
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(HexagonalConnectionMove.of([new Coord(cx, cy)]));
    });

    it('should count all possible moves including only neighboring-coord', () => {
        // Given a board with 60 possibles combinations of two coords
        // With the firsts being neighbors of a piece on board
        // and the seconds being neighbors of a piece on board or of the firsts coords
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

        // When listing the moves
        const moves: HexagonalConnectionMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the answer should be 65
        expect(moves.length).toBe(65);
    });

});
