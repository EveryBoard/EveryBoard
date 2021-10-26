
import { GoMove } from '../GoMove';
import { Phase, GoState, GoPiece } from '../GoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { GoLegalityStatus } from '../GoLegalityStatus';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoRules } from '../GoRules';
import { GoMinimax } from '../GoMinimax';
import { GoFailure } from '../GoFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('GoRules:', () => {

    let rules: GoRules;
    let minimaxes: Minimax<GoMove, GoState>[];

    const X: GoPiece = GoPiece.WHITE;
    const O: GoPiece = GoPiece.BLACK;
    const k: GoPiece = GoPiece.DEAD_WHITE;
    const u: GoPiece = GoPiece.DEAD_BLACK;
    const w: GoPiece = GoPiece.WHITE_TERRITORY;
    const b: GoPiece = GoPiece.BLACK_TERRITORY;
    const _: GoPiece = GoPiece.EMPTY;

    beforeAll(() => {
        GoState.HEIGHT = 5;
        GoState.WIDTH = 5;
    });
    beforeEach(() => {
        rules = new GoRules(GoState);
        minimaxes = [
            new GoMinimax(rules, 'GoMinimax'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('simple capture should be legal', () => {
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [O, _, _, _, _],
        ];
        const expectedBoard: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [_, X, _, _, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
        const move: GoMove = new GoMove(1, 4);
        const status: GoLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: GoState = rules.applyLegalMove(move, state, status);
        const expectedState: GoState = new GoState(expectedBoard,
                                                   [0, 1],
                                                   2,
                                                   MGPOptional.empty(),
                                                   Phase.PLAYING);
        expect(resultingState).toEqual(expectedState);
    });
    it('complex capture should be legal', () => {
        const board: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, X, X, _],
            [_, X, O, O, X],
            [_, _, _, O, X],
            [_, _, _, X, _],
        ];
        const expectedBoard: Table<GoPiece> = [
            [_, _, _, _, _],
            [_, _, X, X, _],
            [_, X, _, _, X],
            [_, _, X, _, X],
            [_, _, _, X, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
        const move: GoMove = new GoMove(2, 3);
        const status: GoLegalityStatus = rules.isLegal(move, state);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingState: GoState = rules.applyLegalMove(move, state, status);
        const expectedState: GoState = new GoState(expectedBoard,
                                                   [0, 3],
                                                   2,
                                                   MGPOptional.empty(),
                                                   Phase.PLAYING);
        expect(resultingState).toEqual(expectedState);
    });
    it('superposition should be illegal in playing phase', () => {
        expect(rules.choose(new GoMove(0, 1))).toBeTrue();
        expect(rules.choose(new GoMove(0, 1))).toBeFalse();
    });
    it('ko should be illegal', () => {
        const board: Table<GoPiece> = [
            [_, X, O, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: Table<GoPiece> = [
            [O, _, O, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
        const move: GoMove = new GoMove(0, 0);
        const status: GoLegalityStatus = rules.isLegal(move, state);
        const resultingState: GoState = rules.applyLegalMove(move, state, status);
        const koCoord: MGPOptional<Coord> = MGPOptional.of(new Coord(1, 0));
        const expectedState: GoState = new GoState(expectedBoard, [1, 0], 1, koCoord, Phase.PLAYING);
        expect(resultingState).toEqual(expectedState);
        expect(rules.isLegal(new GoMove(1, 0), resultingState).legal.reason).toBe(GoFailure.ILLEGAL_KO());
    });
    it('snap back should be legal', () => {
        expect(rules.choose(new GoMove(2, 4))).toBeTrue(); expect(rules.choose(new GoMove(3, 4))).toBeTrue();
        expect(rules.choose(new GoMove(2, 3))).toBeTrue(); expect(rules.choose(new GoMove(3, 3))).toBeTrue();
        expect(rules.choose(new GoMove(3, 2))).toBeTrue(); expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.choose(new GoMove(4, 2))).toBeTrue(); expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.choose(new GoMove(4, 4))).toBeTrue(); // Capturable pawn on purpose (snapback)
        expect(rules.choose(new GoMove(4, 3))).toBeTrue(); // Capture NOT creating ko
        expect(rules.choose(new GoMove(4, 4))).toBeTrue(); // Legal snapback
    });
    describe('Phase.PLAYING', () => {
        it('Phase.PLAYING + GoMove.PASS = Phase.PASSED', () => {
            expect(rules.node.gameState.phase).toBe(Phase.PLAYING);
            expect(rules.choose(GoMove.PASS)).toBeTrue();
            expect(rules.node.gameState.phase).toBe(Phase.PASSED);
        });
        it('Phase.PLAYING Should forbid accepting', () => {
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [O, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
            const move: GoMove = GoMove.ACCEPT;
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.reason).toBe(GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE());
        });
        it('Should forbid to play on occupied case', () => {
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [O, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
            const move: GoMove = new GoMove(0, 4);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.reason).toBe(GoFailure.OCCUPIED_INTERSECTION());
        });
        it('Should forbid suicide', () => {
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [_, X, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
            const move: GoMove = new GoMove(0, 4);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.reason).toBe(GoFailure.CANNOT_COMMIT_SUICIDE());
        });
    });
    describe('Phase.PASSED', () => {
        it('Phase.PASSED + GoMove/play = Phase.PLAYING', () => {
            expect(rules.choose(GoMove.PASS)).toBeTrue();
            expect(rules.node.gameState.phase).toBe(Phase.PASSED);

            expect(rules.choose(new GoMove(1, 1))).toBeTrue();

            expect(rules.node.gameState.phase).toBe(Phase.PLAYING);
        });
        it('Phase.PASSED + GoMove.PASS = Phase.COUNTING', () => {
            const board: Table<GoPiece> = [
                [_, _, O, X, O],
                [_, _, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, X],
                [_, _, O, X, _],
            ];
            const expectedBoard: Table<GoPiece> = [
                [b, b, O, X, O],
                [b, b, O, X, _],
                [b, b, O, X, _],
                [b, b, O, X, X],
                [b, b, O, X, w],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PASSED);
            const move: GoMove = GoMove.PASS;
            const status: GoLegalityStatus = rules.isLegal(move, state);
            const resultingState: GoState = rules.applyLegalMove(move, state, status);
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [10, 1],
                                                       1,
                                                       MGPOptional.empty(),
                                                       Phase.COUNTING);
            expect(resultingState).toEqual(expectedState);
        });
    });
    describe('Phase.COUNTING', () => {
        it('Phase.COUNTING + GoMove/markAsDead = Phase.COUNTING (without shared territory)', () => {
            const board: Table<GoPiece> = [
                [b, O, X, w, w],
                [b, O, X, w, w],
                [b, O, X, w, w],
                [b, O, X, w, w],
                [b, O, X, w, w],
            ];
            const expectedBoard: Table<GoPiece> = [
                [w, u, X, w, w],
                [w, u, X, w, w],
                [w, u, X, w, w],
                [w, u, X, w, w],
                [w, u, X, w, w],
            ];
            const state: GoState = new GoState(board, [5, 10], 0, MGPOptional.empty(), Phase.COUNTING);
            const move: GoMove = new GoMove(1, 1);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: GoState = rules.applyLegalMove(move, state, status);
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [0, 25],
                                                       1,
                                                       MGPOptional.empty(),
                                                       Phase.COUNTING);
            expect(resultingState).toEqual(expectedState);
        });
        it('Phase.COUNTING + GoMove/markAsDead = Phase.COUNTING (with shared territory)', () => {
            const board: Table<GoPiece> = [
                [b, b, O, X, O],
                [b, b, O, X, _],
                [b, b, O, X, _],
                [b, b, O, X, X],
                [b, b, O, X, w],
            ];
            const expectedBoard: Table<GoPiece> = [
                [b, b, O, X, u],
                [b, b, O, X, w],
                [b, b, O, X, w],
                [b, b, O, X, X],
                [b, b, O, X, w],
            ];
            const state: GoState = new GoState(board, [10, 1], 0, MGPOptional.empty(), Phase.COUNTING);
            const move: GoMove = new GoMove(4, 0);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            const resultingState: GoState = rules.applyLegalMove(move, state, status);
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [10, 5],
                                                       1,
                                                       MGPOptional.empty(),
                                                       Phase.COUNTING);
            expect(resultingState).toEqual(expectedState);
        });
        it('Phase.COUNTING + GoMove/play = Phase.PLAYING', () => {
            const board: Table<GoPiece> = [
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, k, O],
            ];
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, X],
                [_, _, _, X, _],
            ];
            const state: GoState = new GoState(board, [25, 0], 1, MGPOptional.empty(), Phase.COUNTING);
            const move: GoMove = new GoMove(4, 3);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: GoState = rules.applyLegalMove(move, state, status);
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [0, 1],
                                                       2,
                                                       MGPOptional.empty(),
                                                       Phase.PLAYING);
            expect(resultingState).toEqual(expectedState);
        });
        it('Phase.COUNTING + GoMove.ACCEPT = Phase.ACCEPT', () => {
            expect(rules.choose(GoMove.PASS)).toBeTrue();
            expect(rules.choose(GoMove.PASS)).toBeTrue();
            expect(rules.node.gameState.phase).toBe(Phase.COUNTING);

            expect(rules.choose(GoMove.ACCEPT)).toBeTrue();

            expect(rules.node.gameState.phase).toBe(Phase.ACCEPT);
        });
        it('Phase.COUNTING Should forbid PASSING', () => {
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [O, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.COUNTING);
            const move: GoMove = GoMove.PASS;
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.reason).toBe(GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE());
        });
    });
    describe('Phase.ACCEPT', () => {
        it('Phase.ACCEPT + GoMove/play = Phase.PLAYING', () => {
            const board: Table<GoPiece> = [
                [b, k, b, O, b],
                [b, k, b, O, b],
                [b, k, b, O, O],
                [O, k, b, O, b],
                [b, k, b, O, b],
            ];
            const expectedBoard: Table<GoPiece> = [
                [_, X, _, O, _],
                [_, X, _, O, _],
                [X, X, _, O, O],
                [O, X, _, O, _],
                [_, X, _, O, _],
            ];
            const state: GoState = new GoState(board, [23, 0], 1, MGPOptional.empty(), Phase.COUNTING);
            const move: GoMove = new GoMove(0, 2);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: GoState = rules.applyLegalMove(move, state, status);
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [0, 0],
                                                       2,
                                                       MGPOptional.empty(),
                                                       Phase.PLAYING);
            expect(resultingState).toEqual(expectedState);
        });
        it('Phase.ACCEPT + GoMove/play should capture', () => {
            const board: Table<GoPiece> = [
                [w, w, w, w, w],
                [w, w, w, w, w],
                [w, w, w, w, X],
                [w, w, w, X, w],
                [w, w, w, X, u],
            ];
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, X],
                [_, _, _, X, X],
                [_, _, _, X, _],
            ];
            const state: GoState = new GoState(board, [0, 23], 1, MGPOptional.empty(), Phase.ACCEPT);
            const move: GoMove = new GoMove(4, 3);
            const status: GoLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.isSuccess()).toBeTrue();
            const resultingState: GoState = rules.applyLegalMove(move, state, status);
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [0, 1],
                                                       2,
                                                       MGPOptional.empty(),
                                                       Phase.PLAYING);
            expect(resultingState).toEqual(expectedState);
        });
        it('Phase.ACCEPT + GoMove/markAsDead = Phase.COUNTING', () => {
            expect(rules.choose(new GoMove(1, 1))).toBeTrue(); // Playing
            expect(rules.choose(GoMove.PASS)).toBeTrue(); // Passed
            expect(rules.choose(GoMove.PASS)).toBeTrue(); // Counting
            expect(rules.choose(GoMove.ACCEPT)).toBeTrue(); // Accept
            expect(rules.node.gameState.phase).toBe(Phase.ACCEPT);

            expect(rules.choose(new GoMove(1, 1))).toBeTrue(); // Counting

            expect(rules.node.gameState.phase).toBe(Phase.COUNTING);
        });
        it('Phase.ACCEPT + GoMove.ACCEPT = Game Over', () => {
            expect(rules.choose(new GoMove(1, 1))).toBeTrue(); // Playing
            expect(rules.choose(GoMove.PASS)).toBeTrue(); // Passed
            expect(rules.choose(GoMove.PASS)).toBeTrue(); // Counting
            expect(rules.choose(GoMove.ACCEPT)).toBeTrue(); // Accept
            expect(rules.node.gameState.phase).toBe(Phase.ACCEPT);

            expect(rules.choose(GoMove.ACCEPT)).toBeTrue();

            expect(rules.getGameStatus(rules.node).isEndGame).toBeTrue();
            expect(rules.node.gameState.phase).toBe(Phase.FINISHED);
        });
    });
    it('should markAndCountTerritory correctly, bis', () => {
        const board: Table<GoPiece> = [
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
        ];
        const expectedBoard: GoPiece[][] = [
            [b, O, k, b, b],
            [b, O, k, b, b],
            [b, O, k, b, b],
            [b, O, k, b, b],
            [b, O, k, b, b],
        ];
        const state: GoState = new GoState(board, [5, 10], 0, MGPOptional.empty(), Phase.COUNTING);
        const move: GoMove = new GoMove(2, 2);
        const status: GoLegalityStatus = rules.isLegal(move, state);
        const resultingState: GoState = rules.applyLegalMove(move, state, status);
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingState.getCopiedBoard()).toEqual(expectedBoard);
        expect(resultingState.getCapturedCopy()).toEqual([25, 0]);
    });
    it('simply shared board should be simple to calculate', () => {
        const previousBoard: Table<GoPiece> = [
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
        ];
        const expectedBoard: GoPiece[][] = [
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, w],
        ];
        const state: GoState = new GoState(previousBoard, [0, 0], 10, MGPOptional.empty(), Phase.PASSED);
        const move: GoMove = GoMove.PASS;
        const legality: GoLegalityStatus = rules.isLegal(move, state);
        const resultingState: GoState = rules.applyLegalMove(move, state, legality);
        expect(resultingState.getCapturedCopy()).withContext('Board score should be 10 against 5').toEqual([10, 5]);
        expect(resultingState.getCopiedBoard()).toEqual(expectedBoard);
    });
    it('AddDeadToScore should be a simple counting method', () => {
        const board: Table<GoPiece> = [
            [u, _, _, _, _],
            [_, u, _, _, _],
            [_, _, k, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const captured: number[] = [6, 1];
        const stateWithDead: GoState = new GoState(board, captured, 0, MGPOptional.empty(), Phase.PLAYING);

        const expectedScore: number[] = [7, 3];
        const score: number[] = GoRules.addDeadToScore(stateWithDead);
        expect(score).withContext('Score should be 7 vs 3').toEqual(expectedScore);
    });
    it('Should calculate correctly board with dead stones', () => {
        const board: Table<GoPiece> = [
            [_, _, X, O, _],
            [_, _, X, O, _],
            [_, _, X, O, X],
            [X, X, X, O, _],
            [_, O, O, O, _],
        ];
        const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PASSED);
        rules.node = new MGPNode(null, null, state);
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.node.gameState.phase).toBe(Phase.COUNTING);
        expect(rules.choose(new GoMove(4, 2))).toBeTrue();
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();
        RulesUtils.expectToBeDraw(rules, rules.node, minimaxes);
    });
});
