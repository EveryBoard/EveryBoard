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
import { MartianChessPiece, MartianChessState } from '../MartianChessState';

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
    it('should includes all moves at first turn', () => {
        // Given the initial state
        const state: MartianChessState = MartianChessState.getInitialState();
        const node: MartianChessNode = new MartianChessNode(state);

        // When asking the list of moves
        const moves: MartianChessMove[] = minimax.getListMoves(node);

        // Then half the move would includes call the clock
        const clockCalled: MartianChessMove[] = moves.filter((m: MartianChessMove) => m.calledTheClock);
        const notCalled: MartianChessMove[] = moves.filter((m: MartianChessMove) => m.calledTheClock);
        expect(clockCalled.length).toBe(10);
        expect(notCalled.length).toBe(10);

        // each of thoses half would contain 7 pawn moves
        const pawnAndClock: MartianChessMove[] = clockCalled.filter((m: MartianChessMove) => isPawnMove(m, state));
        const pawnWithoutClock: MartianChessMove[] = notCalled.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawnAndClock.length).toBe(7);
        expect(pawnWithoutClock.length).toBe(7);

        // each of thoses half would contain 3 drone move
        const droneAndClock: MartianChessMove[] = clockCalled.filter((m: MartianChessMove) => isDroneMove(m, state));
        const droneWithoutClock: MartianChessMove[] = notCalled.filter((m: MartianChessMove) => isDroneMove(m, state));
        expect(droneAndClock.length).toBe(3);
        expect(droneWithoutClock.length).toBe(3);
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

        // Then the 14 moves should be included (times two for the called clock)
        const notCalled: MartianChessMove[] = moves.filter((m: MartianChessMove) => m.calledTheClock);
        const pawnWithoutClock: MartianChessMove[] = notCalled.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawnWithoutClock.length).toBe(6);
        expect(moves.length).toBe(12);
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

        // Then the 9 moves should be included, 2 for the pawn and 7 for the drone
        const pawn: MartianChessMove[] = moves.filter((m: MartianChessMove) => isPawnMove(m, state));
        expect(pawn.length).toBe(2);
        expect(moves.length).toBe(9);
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
        console.log(moves)
        console.log(reverse)
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

        // Then the 12 moves should be included, but only once (not with clock called)
        expect(moves.length).toBe(12);
    });
    it('should simply prefer higher score', () => {
        const weakState: MartianChessState = MartianChessState.getInitialState();
        const empty: MGPOptional<MartianChessMove> = MGPOptional.empty();
        const strongBoard: Table<MartianChessPiece> = weakState.getCopiedBoard();
        const captured: MGPMap<Player, number> = weakState.captured.getCopy();
        captured.replace(Player.ZERO, 1);
        const strongState: MartianChessState = new MartianChessState(strongBoard,
                                                                     0,
                                                                     MGPOptional.empty(),
                                                                     MGPOptional.empty(),
                                                                     captured);
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax, weakState, empty, strongState, empty, Player.ZERO);
    });
});
