import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { GipfLegalityStatus } from '../GipfLegalityStatus';
import { GipfCapture, GipfMove, GipfPlacement } from '../GipfMove';
import { GipfState } from '../GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GipfNode, GipfRules } from '../GipfRules';
import { GipfMinimax } from '../GipfMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GipfFailure } from '../GipfFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { Minimax } from 'src/app/jscaip/Minimax';

describe('GipfRules:', () => {

    // Rules of gipf with the diagrams used in these tests: http://www.gipf.com/gipf/rules/complete_rules.html
    const N: FourStatePiece = FourStatePiece.NONE;
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const A: FourStatePiece = FourStatePiece.ZERO;
    const B: FourStatePiece = FourStatePiece.ONE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    let rules: GipfRules;

    let minimaxes: Minimax<GipfMove, GipfState>[];

    beforeEach(() => {
        rules = new GipfRules(GipfState);
        minimaxes = [
            new GipfMinimax(rules, 'GipfMinimax'),
        ];
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gameState.turn).withContext('Game should start at turn 0').toBe(0);
    });
    it('should start with the expected board for the basic variant', () => {
        const state: GipfState = rules.node.gameState;
        const expectedState: GipfState = new GipfState([
            [N, N, N, B, _, _, A],
            [N, N, _, _, _, _, _],
            [N, _, _, _, _, _, _],
            [A, _, _, _, _, _, B],
            [_, _, _, _, _, _, N],
            [_, _, _, _, _, N, N],
            [B, _, _, A, N, N, N],
        ], 0, state.sidePieces, state.capturedPieces);
        state.forEachCoord((c: Coord, content: FourStatePiece) => {
            expect(content).toEqual(expectedState.getPieceAt(c));
        });
    });
    describe('isLegal and applyLegalMove', () => {
        it('should forbid placements on non-border cases', () => {
            const state: GipfState = rules.node.gameState;
            const placement: GipfPlacement = new GipfPlacement(new Coord(3, 3), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.reason).toBe(GipfFailure.PLACEMENT_NOT_ON_BORDER());
        });
        it('should require a direction when placing a piece on an occupied case', () => {
            const state: GipfState = rules.node.gameState;
            const placement: GipfPlacement = new GipfPlacement(new Coord(3, 0), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.reason).toBe(GipfFailure.PLACEMENT_WITHOUT_DIRECTION());
        });
        it('should allow simple move without direction when target coord is empty', () => {
            const state: GipfState = rules.node.gameState;
            const placement: GipfPlacement = new GipfPlacement(new Coord(6, 1), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: GipfState = rules.applyLegalMove(move, state, legality);

            // This is diagram 2b in the rules of Gipf
            const expectedState: GipfState = new GipfState([
                [N, N, N, B, _, _, A],
                [N, N, _, _, _, _, A],
                [N, _, _, _, _, _, _],
                [A, _, _, _, _, _, B],
                [_, _, _, _, _, _, N],
                [_, _, _, _, _, N, N],
                [B, _, _, A, N, N, N],
            ], state.turn, state.sidePieces, state.capturedPieces);
            resultingState.forEachCoord((c: Coord, content: FourStatePiece) => {
                expect(content).toEqual(expectedState.getPieceAt(c));
            });
        });
        it('should allow simple moves without captures when possible', () => {
            // This is diagram 2a in the rules of Gipf
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: GipfState = rules.applyLegalMove(move, state, legality);

            // This is diagram 2b in the rules of Gipf
            const expectedBoard: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, A],
                [N, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, N],
                [B, _, B, _, _, N, N],
                [_, A, _, _, N, N, N],
            ];
            const expectedState: GipfState = new GipfState(expectedBoard, P1Turn, [4, 5], [0, 0]);

            expect(resultingState.equals(expectedState)).toBeTrue();
        });
        it('should not allow placements on blocked lines', () => {
            // This is diagram 3
            const board: Table<FourStatePiece> = [
                [N, N, N, B, B, B, A],
                [N, N, _, _, _, _, A],
                [N, _, _, _, _, A, _],
                [A, B, A, A, B, B, A],
                [A, B, _, A, _, _, N],
                [B, A, B, B, _, N, N],
                [B, A, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const invalidPlacements: GipfPlacement[] = [
                new GipfPlacement(new Coord(3, 0), MGPOptional.of(HexaDirection.RIGHT)),
                new GipfPlacement(new Coord(0, 3), MGPOptional.of(HexaDirection.RIGHT)),
                new GipfPlacement(new Coord(6, 1), MGPOptional.of(HexaDirection.DOWN_LEFT)),
                new GipfPlacement(new Coord(0, 6), MGPOptional.of(HexaDirection.LEFT)),
                new GipfPlacement(new Coord(6, 3), MGPOptional.of(HexaDirection.LEFT)),
                new GipfPlacement(new Coord(1, 6), MGPOptional.of(HexaDirection.UP_RIGHT)),
            ];
            for (const placement of invalidPlacements) {
                const move: GipfMove = new GipfMove(placement, [], []);
                const status: GipfLegalityStatus = rules.isLegal(move, state);
                expect(status.legal.reason).toBe(GipfFailure.PLACEMENT_ON_COMPLETE_LINE());
            }
        });
        it('should refuse moves with invalid direction', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, B, B, B, A],
                [N, N, _, _, _, _, A],
                [N, _, _, _, _, A, _],
                [A, B, A, A, B, B, A],
                [A, _, _, A, _, _, N],
                [_, A, _, B, _, N, N],
                [_, A, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6), MGPOptional.of(HexaDirection.LEFT));
            const move: GipfMove = new GipfMove(placement, [], []);
            const status: GipfLegalityStatus = rules.isLegal(move, state);
            expect(status.legal.reason).toBe(GipfFailure.INVALID_PLACEMENT_DIRECTION());
        });
        it('should force to capture consecutive pieces', () => {
            // This is diagram 4 in the rules of Gipf
            const linesAndCaptures: [FourStatePiece[], number[]][] = [
                [[B, B, B, B, _, B, A], [0, 1, 2, 3]],
                [[B, B, B, B, A, _, A], [0, 1, 2, 3, 4]],
                [[B, A, B, B, B, B, _], [0, 1, 2, 3, 4, 5]],
                [[A, B, B, B, B, A, B], [0, 1, 2, 3, 4, 5, 6]],
            ];
            for (const [line, capturePositions] of linesAndCaptures) {
                const board: Table<FourStatePiece> = [
                    [N, N, N, _, _, _, _],
                    [N, N, _, _, _, _, _],
                    [N, _, _, _, _, _, _],
                    line,
                    [_, _, _, _, _, _, N],
                    [_, _, _, _, _, N, N],
                    [_, _, _, _, N, N, N],
                ];
                const state: GipfState = new GipfState(board, P1Turn, [5, 5], [0, 0]);
                const capture: GipfCapture = new GipfCapture(capturePositions.map((q: number) => new Coord(q, 3)));
                const placement: GipfPlacement = new GipfPlacement(new Coord(3, 0), MGPOptional.empty());
                const move: GipfMove = new GipfMove(placement, [capture], []);
                const legality: GipfLegalityStatus = rules.isLegal(move, state);
                expect(legality.legal.isSuccess()).toBeTrue();
            }
        });
        it('should force to capture when possible', () => {
            // This is diagram 5a
            const board: Table<FourStatePiece> = [
                [N, N, N, B, _, B, B],
                [N, N, _, _, B, A, _],
                [N, _, _, _, B, B, _],
                [B, _, B, B, A, B, B],
                [_, _, A, B, _, _, N],
                [_, B, A, _, _, N, N],
                [A, A, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const firstPlacement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                                    MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(firstPlacement, [], []);
            const firstLegality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(firstLegality.legal.isSuccess()).toBeTrue();

            const resultingState: GipfState = rules.applyLegalMove(move, state, firstLegality);
            const placement: GipfPlacement = new GipfPlacement(new Coord(2, 6),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));

            const moveWithoutCapture: GipfMove = new GipfMove(placement, [], []);
            const noCaptureLegality: GipfLegalityStatus = rules.isLegal(moveWithoutCapture, resultingState);
            expect(noCaptureLegality.legal.reason).toBe(GipfFailure.MISSING_CAPTURES());

            const capture: GipfCapture = new GipfCapture([
                new Coord(2, 3), new Coord(3, 3), new Coord(4, 3), new Coord(5, 3), new Coord(6, 3),
            ]);
            const moveWithCapture: GipfMove = new GipfMove(placement, [capture], []);
            const captureLegality: GipfLegalityStatus = rules.isLegal(moveWithCapture, resultingState);
            expect(captureLegality.legal.isSuccess()).toBeTrue();
        });
        it('should let player choose between intersecting captures', () => {
            // This is diagram 6
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, _],
                [N, N, _, _, _, _, _],
                [N, _, _, A, _, A, _],
                [B, B, B, B, B, _, _],
                [_, A, B, _, _, _, N],
                [A, _, B, _, _, N, N],
                [_, _, B, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P1Turn, [5, 5], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));

            const capture1: GipfCapture = new GipfCapture([
                new Coord(0, 3), new Coord(1, 3), new Coord(2, 3), new Coord(3, 3), new Coord(4, 3),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 4), new Coord(2, 3),
            ]);

            const moveWithoutCapture: GipfMove = new GipfMove(placement, [], []);
            const noCaptureLegality: GipfLegalityStatus = rules.isLegal(moveWithoutCapture, state);
            expect(noCaptureLegality.legal.reason).toBe(GipfFailure.MISSING_CAPTURES());

            const moveWithCapture1: GipfMove = new GipfMove(placement, [capture1], []);
            const capture1Legality: GipfLegalityStatus = rules.isLegal(moveWithCapture1, state);
            expect(capture1Legality.legal.isSuccess()).toBeTrue();

            const moveWithCapture2: GipfMove = new GipfMove(placement, [capture2], []);
            const capture2Legality: GipfLegalityStatus = rules.isLegal(moveWithCapture2, state);
            expect(capture2Legality.legal.isSuccess()).toBeTrue();

            const moveWithBothCaptures: GipfMove = new GipfMove(placement, [capture1, capture2], []);
            const capturesLegality: GipfLegalityStatus = rules.isLegal(moveWithBothCaptures, state);
            expect(capturesLegality.legal.reason).toBe(GipfFailure.CAPTURE_MUST_BE_ALIGNED());
        });
        it('should force both players to capture when possible', () => {
            // This is the board before diagram 7
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, A],
                [N, N, _, _, _, B, B],
                [N, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, B, _, _, _, N],
                [_, _, A, _, _, N, N],
                [_, A, A, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);

            const placementA: GipfPlacement = new GipfPlacement(new Coord(0, 4),
                                                                MGPOptional.of(HexaDirection.RIGHT));

            const moveANoCapture: GipfMove = new GipfMove(placementA, [], []);
            expect(rules.isLegal(moveANoCapture, state).legal.reason).toBe(GipfFailure.MISSING_CAPTURES());

            const captureA: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 4), new Coord(2, 3), new Coord(2, 2),
            ]);

            const moveA: GipfMove = new GipfMove(placementA, [], [captureA]);

            const legalityA: GipfLegalityStatus = rules.isLegal(moveA, state);
            expect(legalityA.legal.isSuccess()).toBeTrue();

            const resultingState: GipfState = rules.applyLegalMove(moveA, state, legalityA);

            const placementB: GipfPlacement = new GipfPlacement(new Coord(3, 0),
                                                                MGPOptional.of(HexaDirection.RIGHT));
            const moveBNoCapture: GipfMove = new GipfMove(placementB, [], []);
            expect(rules.isLegal(moveBNoCapture, resultingState).legal.reason).toBe(GipfFailure.MISSING_CAPTURES());

            const captureB: GipfCapture = new GipfCapture([
                new Coord(3, 4), new Coord(4, 3), new Coord(5, 2), new Coord(6, 1),
            ]);
            const moveB: GipfMove = new GipfMove(placementB, [captureB], []);

            const legalityB: GipfLegalityStatus = rules.isLegal(moveB, resultingState);
            expect(legalityB.legal.isSuccess()).toBeTrue();
        });
        it('should not allow invalid initial captures', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, A],
                [N, N, _, _, _, B, B],
                [N, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, A, _, _, _, N],
                [_, _, A, _, _, N, N],
                [_, A, A, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 1),
                                                               MGPOptional.of(HexaDirection.RIGHT));
            const capture1: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 3), new Coord(2, 4),
            ]);
            const move1: GipfMove = new GipfMove(placement, [capture1], []);
            const legality1: GipfLegalityStatus = rules.isLegal(move1, state);
            expect(legality1.legal.reason).toBe(GipfFailure.INVALID_CAPTURED_PIECES());

            const capture2: GipfCapture = new GipfCapture([
                new Coord(1, 6), new Coord(1, 5), new Coord(1, 3), new Coord(1, 4),
            ]);
            const move2: GipfMove = new GipfMove(placement, [capture2], []);
            const legality2: GipfLegalityStatus = rules.isLegal(move2, state);
            expect(legality2.legal.reason).toBe(GipfFailure.CAPTURE_MUST_BE_ALIGNED());
        });
        it('should not allow invalid final captures', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, A],
                [N, N, _, _, _, B, B],
                [N, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, B, _, _, _, N],
                [_, _, A, _, _, N, N],
                [_, A, A, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(0, 4),
                                                               MGPOptional.of(HexaDirection.RIGHT));
            const capture: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 3), new Coord(2, 4),
            ]);
            const move: GipfMove = new GipfMove(placement, [], [capture]);
            const legality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.reason).toBe(GipfFailure.INVALID_CAPTURED_PIECES());
        });
        it('should correctly apply move even if the results are not cached in the legality status', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, state);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingState: GipfState =
                rules.applyLegalMove(move, state, new GipfLegalityStatus(MGPValidation.SUCCESS, null));

            const expectedBoard: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, A],
                [N, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, N],
                [B, _, B, _, _, N, N],
                [_, A, _, _, N, N, N],
            ];
            const expectedState: GipfState = new GipfState(expectedBoard, P1Turn, [4, 5], [0, 0]);

            expect(resultingState.equals(expectedState)).toBeTrue();
        });
    });
    describe('applyPlacement', () => {
        it('should not allow applying placements where a piece already is no direction is given', () => {
            const state: GipfState = rules.node.gameState;
            const placement: GipfPlacement = new GipfPlacement(new Coord(6, 3), MGPOptional.empty());
            expect(() => GipfRules.applyPlacement(state, placement)).toThrow();
        });
    });
    describe('getBoardValue', () => {
        const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                           MGPOptional.of(HexaDirection.UP_RIGHT));
        const dummyMove: GipfMove = new GipfMove(placement, [], []);
        it('should declare victory when one player does not have any piece left', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state1: GipfState = new GipfState(board, P0Turn, [0, 5], [0, 0]);
            const node1: GipfNode = new MGPNode(null, dummyMove, state1);
            RulesUtils.expectToBeVictoryFor(rules, node1, Player.ONE, minimaxes);
            const state2: GipfState = new GipfState(board, P1Turn, [5, 0], [0, 0]);
            const node2: GipfNode = new MGPNode(null, dummyMove, state2);
            RulesUtils.expectToBeVictoryFor(rules, node2, Player.ZERO, minimaxes);
        });
        it('should not declare victory when one player does not have pieces left but still has an initial capture', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, _],
                [N, N, _, _, _, _, _],
                [N, _, _, A, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, A, _, _, N],
                [_, _, _, A, _, N, N],
                [_, _, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, [0, 5], [0, 0]);
            RulesUtils.expectToBeOngoing(rules, new MGPNode(null, dummyMove, state), minimaxes);
        });
    });
    describe('getAllDirectionsForEntrance', () => {
        it('should fail on non-entrances', () => {
            expect(() => GipfRules.getAllDirectionsForEntrance(rules.node.gameState, new Coord(3, 3))).toThrow();
        });
    });
});
