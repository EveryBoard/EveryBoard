/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MartianChessDummyMinimax } from '../MartianChessDummyMinimax';
import { MartianChessMove } from '../MartianChessMove';
import { MartianChessNode, MartianChessRules } from '../MartianChessRules';
import { MartianChessCapture, MartianChessState } from '../MartianChessState';
import { MartianChessPiece } from '../MartianChessPiece';

describe('MartianChessDummyMinimax', () => {

    const _: MartianChessPiece = MartianChessPiece.EMPTY;
    const A: MartianChessPiece = MartianChessPiece.PAWN;
    const B: MartianChessPiece = MartianChessPiece.DRONE;
    const C: MartianChessPiece = MartianChessPiece.QUEEN;

    let rules: MartianChessRules;
    let minimax: MartianChessDummyMinimax;

    function isPawnMove(move: MartianChessMove, state: MartianChessState): boolean {
        return state.getPieceAt(move.coord) === MartianChessPiece.PAWN;
    }
    function isDroneMove(move: MartianChessMove, state: MartianChessState): boolean {
        return state.getPieceAt(move.coord) === MartianChessPiece.DRONE;
    }
    beforeEach(() => {
        rules = new MartianChessRules(MartianChessState);
        minimax = new MartianChessDummyMinimax(rules, 'MartianChessDummyMinimax');
    });
    it('should includes all moves at first turn (but no call the clock)', () => {
        // Given the initial state
        const state: MartianChessState = MartianChessState.getInitialState();
        const node: MartianChessNode = new MartianChessNode(state);

        // When asking the list of moves
        const moves: MartianChessMove[] = minimax.getListMoves(node);

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
        const state: MartianChessState = new MartianChessState(board, 0);
        const node: MartianChessNode = new MartianChessNode(state);

        // When asking the list of moves
        const moves: MartianChessMove[] = minimax.getListMoves(node);

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
        const state: MartianChessState = new MartianChessState(board, 0, MGPOptional.empty(), MGPOptional.of(1));
        const node: MartianChessNode = new MartianChessNode(state);

        // When asking the list of moves
        const moves: MartianChessMove[] = minimax.getListMoves(node);

        // Then the 15 moves should be included, 2 for the pawn and 13 for the drone
        const pawn: MartianChessMove[] = moves.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawn.length).toBe(2);
        const drone: MartianChessMove[] = moves.filter((m: MartianChessMove) => isDroneMove(m, state));
        expect(drone.length).toBe(13);
        expect(moves.length).toBe(15);
    });
    it('should exclude illegal "move cancellation"', () => {
        // Given a state in which last move could be cancelled
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
        const state: MartianChessState = new MartianChessState(board, 0, optLast, MGPOptional.of(1));
        const node: MartianChessNode = new MartianChessNode(state);

        // When asking the list of moves
        const moves: MartianChessMove[] = minimax.getListMoves(node);

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
        const state: MartianChessState = new MartianChessState(board, 0, MGPOptional.empty(), MGPOptional.of(4));
        const node: MartianChessNode = new MartianChessNode(state);

        // When asking the list of moves
        const moves: MartianChessMove[] = minimax.getListMoves(node);

        // Then the 13 moves should be included, but only once (not with clock called)
        expect(moves.length).toBe(13);
    });
    it('should simply prefer higher score', () => {
        const weakState: MartianChessState = MartianChessState.getInitialState();
        const empty: MGPOptional<MartianChessMove> = MGPOptional.empty();
        const strongBoard: Table<MartianChessPiece> = weakState.getCopiedBoard();
        const captured: MGPMap<Player, MartianChessCapture> = weakState.captured.getCopy();
        const capturedPawn: MartianChessCapture = MartianChessCapture.from([MartianChessPiece.PAWN]);
        captured.replace(Player.ZERO, capturedPawn);
        const strongState: MartianChessState = new MartianChessState(strongBoard,
                                                                     0,
                                                                     MGPOptional.empty(),
                                                                     MGPOptional.empty(),
                                                                     captured);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax, weakState, empty, strongState, empty, Player.ZERO);
    });
});
