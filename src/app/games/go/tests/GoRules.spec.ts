import { GoMove } from '../GoMove';
import { Phase, GoState, GoPiece } from '../GoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoLegalityInformation, GoNode, GoRules } from '../GoRules';
import { GoMinimax } from '../GoMinimax';
import { GoFailure } from '../GoFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Minimax } from 'src/app/jscaip/Minimax';
import { Player } from 'src/app/jscaip/Player';

describe('GoRules:', () => {

    let rules: GoRules;
    let minimaxes: Minimax<GoMove, GoState, GoLegalityInformation>[];

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
    describe('Phase.PLAYING', () => {
        it('should always be GameStatus.ONGOING', () => {
            // Given starting board
            const state: GoState = GoState.getInitialState();
            const node: GoNode = new GoNode(state);

            // When evaluating it
            // Then it should be ongoing
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
        it('should allow simple capture', () => {
            // Given board with an atari (capture threat)
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [O, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);

            // When doing the capture
            const move: GoMove = new GoMove(1, 4);

            // Then the move should be considered legal
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [_, X, _, _, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [0, 1],
                                                       2,
                                                       MGPOptional.empty(),
                                                       Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should allow complex capture', () => {
            // Given a board where several piece can be captured
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, X, X, _],
                [_, X, O, O, X],
                [_, _, _, O, X],
                [_, _, _, X, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);

            // When playing on their last freedom
            const move: GoMove = new GoMove(2, 3);

            // Then the move should be legal and capture the pieces
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, X, X, _],
                [_, X, _, _, X],
                [_, _, X, _, X],
                [_, _, _, X, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard,
                                                       [0, 3],
                                                       2,
                                                       MGPOptional.empty(),
                                                       Phase.PLAYING);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should create ko coord when needed (for Player.ONE)', () => {
            // Given a board with an imminent ko creation
            const board: Table<GoPiece> = [
                [O, _, O, _, _],
                [X, O, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState =
                new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);

            // When doing the capture
            const move: GoMove = new GoMove(1, 0);

            // Then move should be a success and create a koCoord on the captured stone
            const expectedBoard: Table<GoPiece> = [
                [_, X, O, _, _],
                [X, O, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const koCoord: Coord = new Coord(0, 0);
            const expectedState: GoState =
                new GoState(expectedBoard, [0, 1], 2, MGPOptional.of(koCoord), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should create ko coord when needed (for Player.ZERO)', () => {
            // Given a board with an imminent ko creation
            const board: Table<GoPiece> = [
                [X, _, X, _, _],
                [O, X, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState =
                new GoState(board, [0, 0], 2, MGPOptional.empty(), Phase.PLAYING);

            // When doing the capture
            const move: GoMove = new GoMove(1, 0);

            // Then move should be a success and create a koCoord on the captured stone
            const expectedBoard: Table<GoPiece> = [
                [_, O, X, _, _],
                [O, X, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const koCoord: Coord = new Coord(0, 0);
            const expectedState: GoState =
                new GoState(expectedBoard, [1, 0], 3, MGPOptional.of(koCoord), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('ko should be illegal', () => {
            // Given a board with a Ko
            const board: Table<GoPiece> = [
                [_, X, O, _, _],
                [X, O, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const koCoord: Coord = new Coord(0, 0);
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.of(koCoord), Phase.PLAYING);

            // When playing on the Ko coord
            const move: GoMove = new GoMove(koCoord.x, koCoord.y);

            // Then the move should be illegal
            const reason: string = GoFailure.ILLEGAL_KO();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('capture via-fake-suicide should be legal', () => {
            // Given a board with a possible capture
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, O, O],
                [_, _, O, X, X],
                [_, _, O, X, _], // This could be a pre snap-back board
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);

            // When playing in the 0 freedom coord that capture a group
            const move: GoMove = new GoMove(4, 4);

            // Then the move should be accepted
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, O, O],
                [_, _, O, _, _],
                [_, _, O, _, O],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [3, 0], 1, MGPOptional.empty(), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.PLAYING + GoMove.PASS = Phase.PASSED', () => {
            // Given initial board (so, playing phase)
            expect(rules.node.gameState.phase).toBe(Phase.PLAYING);

            // When passing
            expect(rules.choose(GoMove.PASS)).toBeTrue();

            // Then we should be in passed phase
            expect(rules.node.gameState.phase).toBe(Phase.PASSED);
        });
        it('Phase.PLAYING Should forbid accepting', () => {
            // Given a board in playing phase
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [O, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);

            // When accepting
            const move: GoMove = GoMove.ACCEPT;

            // Then the move should be refused
            const reason: string = GoFailure.CANNOT_ACCEPT_BEFORE_COUNTING_PHASE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('superposition should be illegal in playing phase', () => {
            // Given a board with piece on it
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, X, _],
                [_, O, O, O, X],
                [_, _, _, O, X],
                [_, _, _, X, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);

            // When playing on another piece
            const move: GoMove = new GoMove(2, 2);

            // Then the move should be illegal
            const reason: string = GoFailure.OCCUPIED_INTERSECTION();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
        it('Should forbid suicide', () => {
            // Given a board with a coord without freedom
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [_, X, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);

            // When trying to play in that coord without capturing
            const move: GoMove = new GoMove(0, 4);

            // Then the move should be illegal
            const reason: string = GoFailure.CANNOT_COMMIT_SUICIDE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('Phase.PASSED', () => {
        it('Phase.PASSED + GoMove/play = Phase.PLAYING', () => {
            // Given a board on passed phase
            const board: Table<GoPiece> = [
                [_, _, O, X, O],
                [_, _, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, X],
                [_, _, O, X, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PASSED);

            // When doing a move again
            const move: GoMove = new GoMove(1, 1);

            // Then move should be back to Playing Phase
            const expectedBoard: Table<GoPiece> = [
                [_, _, O, X, O],
                [_, O, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, X],
                [_, _, O, X, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [0, 0], 1, MGPOptional.empty(), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.PASSED + GoMove.PASS = Phase.COUNTING', () => {
            // Given a board on passed phase
            const board: Table<GoPiece> = [
                [_, _, O, X, O],
                [_, _, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, X],
                [_, _, O, X, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PASSED);

            // When passing again
            const move: GoMove = GoMove.PASS;

            // Then the move should be in counting phase
            const expectedBoard: Table<GoPiece> = [
                [b, b, O, X, O],
                [b, b, O, X, _],
                [b, b, O, X, _],
                [b, b, O, X, X],
                [b, b, O, X, w],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [10, 1], 1, MGPOptional.empty(), Phase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('simply shared board should be simple to calculate', () => {
            // Given a simply shared board on which one player passed
            const previousBoard: Table<GoPiece> = [
                [_, _, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, _],
                [_, _, O, X, _],
            ];
            const state: GoState = new GoState(previousBoard, [0, 0], 10, MGPOptional.empty(), Phase.PASSED);

            // When passing again
            const move: GoMove = GoMove.PASS;

            // Then board value should change to match simple territory
            const expectedBoard: GoPiece[][] = [
                [b, b, O, X, w],
                [b, b, O, X, w],
                [b, b, O, X, w],
                [b, b, O, X, w],
                [b, b, O, X, w],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [10, 5], 11, MGPOptional.empty(), Phase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
    });
    describe('Phase.COUNTING', () => {
        it('should always be GameStatus.ONGOING', () => {
            // Given a board with a shared territory
            const board: Table<GoPiece> = [
                [b, b, O, X, u],
                [b, b, O, X, w],
                [b, b, O, X, w],
                [b, b, O, X, X],
                [k, k, O, X, w],
            ];
            const state: GoState = new GoState(board, [10, 1], 0, MGPOptional.empty(), Phase.COUNTING);
            const node: GoNode = new GoNode(state);

            // When evaluating it
            // Then it should be ongoing
            RulesUtils.expectToBeOngoing(rules, node, minimaxes);
        });
        it('should attribute shared territory to surviving group', () => {
            // Given a board with a shared territory
            const board: Table<GoPiece> = [
                [b, b, O, X, O],
                [b, b, O, X, _],
                [b, b, O, X, _],
                [b, b, O, X, X],
                [b, b, O, X, w],
            ];
            const state: GoState = new GoState(board, [10, 1], 0, MGPOptional.empty(), Phase.COUNTING);

            // When marking as dead one of the sharing group
            const move: GoMove = new GoMove(4, 0);

            // Then the piece should be marked as dead and the territory attributed to the opponent
            const expectedBoard: Table<GoPiece> = [
                [b, b, O, X, u],
                [b, b, O, X, w],
                [b, b, O, X, w],
                [b, b, O, X, X],
                [b, b, O, X, w],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [10, 5], 1, MGPOptional.empty(), Phase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should transfer territory when marking group as dead', () => {
            // Given a board where a group own territory
            const board: Table<GoPiece> = [
                [b, O, X, w, w],
                [b, O, X, w, w],
                [b, O, X, w, w],
                [b, O, X, w, w],
                [b, O, X, w, w],
            ];
            const state: GoState = new GoState(board, [5, 10], 0, MGPOptional.empty(), Phase.COUNTING);

            // When marking this group as dead
            const move: GoMove = new GoMove(2, 2);

            // Then it should transfer its territory to the opponent
            const expectedBoard: GoPiece[][] = [
                [b, O, k, b, b],
                [b, O, k, b, b],
                [b, O, k, b, b],
                [b, O, k, b, b],
                [b, O, k, b, b],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [25, 0], 1, MGPOptional.empty(), Phase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.COUNTING + GoMove/play = Phase.PLAYING', () => {
            // Given a board on counting phase (by example, incorrectly marked)
            const board: Table<GoPiece> = [
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, k, O],
            ];
            const state: GoState = new GoState(board, [25, 0], 1, MGPOptional.empty(), Phase.COUNTING);

            // When playing on an empty square
            const move: GoMove = new GoMove(4, 3);

            // Then the move should go back to playing phase
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, X],
                [_, _, _, X, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [0, 1], 2, MGPOptional.empty(), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.COUNTING + GoMove.ACCEPT = Phase.ACCEPT', () => {
            // Given a board on counting phase (by example, incorrectly marked)
            const board: Table<GoPiece> = [
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, b, b],
                [b, b, b, k, O],
            ];
            const state: GoState = new GoState(board, [25, 0], 1, MGPOptional.empty(), Phase.COUNTING);

            // When accepting board
            const move: GoMove = GoMove.ACCEPT;

            // Then the move should go to accept phase
            const expectedState: GoState = new GoState(board, [25, 0], 2, MGPOptional.empty(), Phase.ACCEPT);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('should forbid PASSING', () => {
            // Given a board on counting phase
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [X, _, _, _, _],
                [O, _, _, _, _],
            ];
            const state: GoState = new GoState(board, [0, 0], 1, MGPOptional.empty(), Phase.COUNTING);

            // When passing
            const move: GoMove = GoMove.PASS;

            // Then the move should be rejected
            const reason: string = GoFailure.CANNOT_PASS_AFTER_PASSED_PHASE();
            RulesUtils.expectMoveFailure(rules, state, move, reason);
        });
    });
    describe('Phase.ACCEPT', () => {
        it('Phase.ACCEPT + GoMove/play = Phase.PLAYING', () => {
            // Given an board in accept phase
            const board: Table<GoPiece> = [
                [b, k, b, O, b],
                [b, k, b, O, b],
                [b, k, b, O, O],
                [O, k, b, O, b],
                [b, k, b, O, b],
            ];
            const state: GoState = new GoState(board, [23, 0], 1, MGPOptional.empty(), Phase.COUNTING);

            // When playing on an empty square
            const move: GoMove = new GoMove(0, 2);

            // Then the game should move back to Playing Phase
            const expectedBoard: Table<GoPiece> = [
                [_, X, _, O, _],
                [_, X, _, O, _],
                [X, X, _, O, O],
                [O, X, _, O, _],
                [_, X, _, O, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [0, 0], 2, MGPOptional.empty(), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.ACCEPT + GoMove/play should capture', () => {
            // Given a board on accepted phase
            const board: Table<GoPiece> = [
                [w, w, w, w, w],
                [w, w, w, w, w],
                [w, w, w, w, X],
                [w, w, w, X, w],
                [w, w, w, X, u],
            ];
            const state: GoState = new GoState(board, [0, 23], 1, MGPOptional.empty(), Phase.ACCEPT);

            // When clicking on an empty square that could capture (even if the piece so far is still "dead")
            const move: GoMove = new GoMove(4, 3);

            // Then the capture should be done and the game back to playing phase
            const expectedBoard: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, X],
                [_, _, _, X, X],
                [_, _, _, X, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [0, 1], 2, MGPOptional.empty(), Phase.PLAYING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.ACCEPT + GoMove/markAsDead = Phase.COUNTING', () => {
            // Given a board on accepted phase
            const board: Table<GoPiece> = [
                [w, X, _, O, _],
                [w, X, _, O, _],
                [w, X, _, O, X],
                [w, X, _, O, _],
                [w, X, _, O, _],
            ];
            const state: GoState = new GoState(board, [0, 5], 1, MGPOptional.empty(), Phase.ACCEPT);

            // When clicking on a piece to mark it as dead
            const move: GoMove = new GoMove(4, 2);

            // Then the piece should be marked as dead and the board back to counting phase
            const expectedBoard: Table<GoPiece> = [
                [w, X, _, O, b],
                [w, X, _, O, b],
                [w, X, _, O, k],
                [w, X, _, O, b],
                [w, X, _, O, b],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [6, 5], 2, MGPOptional.empty(), Phase.COUNTING);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
        });
        it('Phase.ACCEPT + GoMove.ACCEPT = Game Over', () => {
            // Given a board on accepted phase
            const board: Table<GoPiece> = [
                [w, X, _, O, _],
                [w, X, _, O, _],
                [w, X, _, O, X],
                [w, X, _, O, _],
                [w, X, _, O, _],
            ];
            const state: GoState = new GoState(board, [0, 5], 1, MGPOptional.empty(), Phase.ACCEPT);

            // When accepting as well
            const move: GoMove = GoMove.ACCEPT;

            // Then the move should be accepted and the game should be over
            const expectedBoard: Table<GoPiece> = [
                [w, X, _, O, _],
                [w, X, _, O, _],
                [w, X, _, O, X],
                [w, X, _, O, _],
                [w, X, _, O, _],
            ];
            const expectedState: GoState = new GoState(expectedBoard, [0, 5], 2, MGPOptional.empty(), Phase.FINISHED);
            const node: GoNode = new GoNode(expectedState);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, minimaxes);
        });
    });
    describe('End Game', () => {
        it('Should calculate correctly board with dead stones (And Recognize Draw)', () => {
            // Given a board with the same number of point for every player
            const board: Table<GoPiece> = [
                [w, w, X, O, b],
                [w, w, X, O, b],
                [w, w, X, O, k],
                [X, X, X, O, b],
                [_, O, O, O, b],
            ];
            const state: GoState = new GoState(board, [6, 6], 4, MGPOptional.empty(), Phase.FINISHED);
            const node: GoNode = new GoNode(state);

            // When evaluating its value
            // Then it should see the draw
            RulesUtils.expectToBeDraw(rules, node, minimaxes);
        });
        it('Should recognize victory', () => {
            // Given a board where Player.ZERO win
            const board: Table<GoPiece> = [
                [w, X, _, O, b],
                [w, X, _, O, b],
                [w, X, _, O, k],
                [w, X, _, O, b],
                [w, X, _, O, b],
            ];
            const state: GoState = new GoState(board, [6, 5], 2, MGPOptional.empty(), Phase.FINISHED);
            const node: GoNode = new GoNode(state);

            // When evaluating it
            // Then it should be recognised as a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
        });
    });
    it('AddDeadToScore should be a simple counting method', () => {
        // Given a board with dead not counted as score yet
        const board: Table<GoPiece> = [
            [u, _, _, _, _],
            [_, u, _, _, _],
            [_, _, k, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const captured: number[] = [6, 1];
        const stateWithDead: GoState = new GoState(board, captured, 0, MGPOptional.empty(), Phase.PLAYING);

        // When calling addDeadToScore
        const score: number[] = GoRules.addDeadToScore(stateWithDead);

        // Then the function should count normally
        const expectedScore: number[] = [7, 3];
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
        rules.node = new GoNode(state);
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.node.gameState.phase).toBe(Phase.COUNTING);
        expect(rules.choose(new GoMove(4, 2))).toBeTrue();
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();
        RulesUtils.expectToBeDraw(rules, rules.node, minimaxes);
    });
});
