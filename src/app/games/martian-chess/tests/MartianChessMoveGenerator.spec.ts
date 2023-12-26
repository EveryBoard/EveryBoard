/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessMove } from '../MartianChessMove';
import { MartianChessNode, MartianChessRules } from '../MartianChessRules';
import { MartianChessState } from '../MartianChessState';
import { MartianChessPiece } from '../MartianChessPiece';
import { MartianChessMoveGenerator } from '../MartianChessMoveGenerator';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('MartianChessMoveGenerator', () => {

    const _: MartianChessPiece = MartianChessPiece.EMPTY;
    const A: MartianChessPiece = MartianChessPiece.PAWN;
    const B: MartianChessPiece = MartianChessPiece.DRONE;
    const C: MartianChessPiece = MartianChessPiece.QUEEN;

    let moveGenerator: MartianChessMoveGenerator;
    const defaultConfig: NoConfig = MartianChessRules.get().getDefaultRulesConfig();

    function isPawnMove(move: MartianChessMove, state: MartianChessState): boolean {
        return state.getPieceAt(move.getStart()) === MartianChessPiece.PAWN;
    }

    function isDroneMove(move: MartianChessMove, state: MartianChessState): boolean {
        return state.getPieceAt(move.getStart()) === MartianChessPiece.DRONE;
    }

    beforeEach(() => {
        moveGenerator = new MartianChessMoveGenerator();
    });

    it('should includes all moves at first turn (but no call the clock)', () => {
        // Given the initial state
        const state: MartianChessState = MartianChessRules.get().getInitialState();
        const node: MartianChessNode = new MartianChessNode(state);

        // When listing the moves
        const moves: MartianChessMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then there should be a total of 13 moves, all, not calling the clock
        const notCalled: MartianChessMove[] = moves.filter((m: MartianChessMove) => m.calledTheClock === false);
        expect(notCalled.length).toBe(13);
        expect(moves.length).toBe(13);

        // 7 pawn moves
        const pawnWithoutClock: MartianChessMove[] = notCalled.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawnWithoutClock.length).toBe(7);

        // and 6 drone moves
        const droneWithoutClock: MartianChessMove[] = notCalled.filter((m: MartianChessMove) => isDroneMove(m, state));
        expect(droneWithoutClock.length).toBe(6);
    });

    it('should include drone promotions and capture', () => {
        // Given a state with pawn on the edge and another
        const board: Table<MartianChessPiece> = [
            [_, _, _, _],
            [_, _, _, _],
            [_, A, _, _],
            [A, _, _, _],
            [_, C, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 1);
        const node: MartianChessNode = new MartianChessNode(state);

        // When listing the moves
        const moves: MartianChessMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then 6 moves should be included
        const notCalled: MartianChessMove[] = moves.filter((m: MartianChessMove) => m.calledTheClock === false);
        const pawnWithoutClock: MartianChessMove[] = notCalled.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawnWithoutClock.length).toBe(6);
        expect(moves.length).toBe(6);
    });

    it('should include queen promotions', () => {
        // Given a state with pawn on the edge a drone
        const board: Table<MartianChessPiece> = [
            [_, _, _, _],
            [_, _, _, _],
            [_, B, _, _],
            [A, _, _, _],
            [_, C, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 1, MGPOptional.empty(), MGPOptional.of(1));
        const node: MartianChessNode = new MartianChessNode(state);

        // When listing the moves
        const moves: MartianChessMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the 15 moves should be included, 2 for the pawn and 13 for the drone
        const pawn: MartianChessMove[] = moves.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawn.length).toBe(2);
        const drone: MartianChessMove[] = moves.filter((m: MartianChessMove) => isDroneMove(m, state));
        expect(drone.length).toBe(13);
        expect(moves.length).toBe(15);
    });

    it('should exclude illegal "move cancelation"', () => {
        // Given a state in which last move could be canceled
        const board: Table<MartianChessPiece> = [
            [_, _, _, _],
            [_, _, _, _],
            [_, B, _, _],
            [A, _, _, _],
            [_, _, _, _],
            [_, _, C, _],
            [_, _, _, _],
            [_, _, _, _],
        ];
        const last: MartianChessMove = MartianChessMove.from(new Coord(1, 4), new Coord(0, 3)).get();
        const optLast: MGPOptional<MartianChessMove> = MGPOptional.of(last);
        const state: MartianChessState = new MartianChessState(board, 1, optLast, MGPOptional.of(1));
        const node: MartianChessNode = new MartianChessNode(state);

        // When listing the moves
        const moves: MartianChessMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the reverse last move should not be in it
        const reverse: MartianChessMove[] = moves.filter((m: MartianChessMove) => m.isUndoneBy(optLast));
        expect(reverse.length).toBe(0);
    });

    it('should count all queen move', () => {
        // Given a state with a queen
        const board: Table<MartianChessPiece> = [
            [_, _, _, A],
            [_, _, C, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, C, _],
            [_, _, _, _],
        ];
        const state: MartianChessState = new MartianChessState(board, 1, MGPOptional.empty(), MGPOptional.of(4));
        const node: MartianChessNode = new MartianChessNode(state);

        // When listing the moves
        const moves: MartianChessMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the 13 moves should be included, but only once (not with clock called)
        expect(moves.length).toBe(13);
    });

});
