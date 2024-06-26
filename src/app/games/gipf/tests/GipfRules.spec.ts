/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MGPFallible, MGPOptional } from '@everyboard/lib';
import { GipfMove, GipfPlacement } from '../GipfMove';
import { GipfState } from '../GipfState';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { GipfLegalityInformation, GipfNode, GipfRules } from '../GipfRules';
import { GipfFailure } from '../GipfFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { GipfCapture } from 'src/app/jscaip/GipfProjectHelper';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';

describe('GipfRules', () => {

    // Rules of gipf with the diagrams used in these tests: http://www.gipf.com/gipf/rules/complete_rules.html
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const _: FourStatePiece = FourStatePiece.EMPTY;
    const A: FourStatePiece = FourStatePiece.ZERO;
    const B: FourStatePiece = FourStatePiece.ONE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn + 1;

    let rules: GipfRules;
    const defaultConfig: NoConfig = GipfRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = GipfRules.get();
    });

    it('should start with the expected board for the basic variant', () => {
        const state: GipfState = GipfRules.get().getInitialState();
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

        it('should forbid placements on non-border spaces', () => {
            const state: GipfState = GipfRules.get().getInitialState();
            const placement: GipfPlacement = new GipfPlacement(new Coord(3, 3), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.PLACEMENT_NOT_ON_BORDER();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should require a direction when placing a piece on an occupied space', () => {
            const state: GipfState = GipfRules.get().getInitialState();
            const placement: GipfPlacement = new GipfPlacement(new Coord(3, 0), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.PLACEMENT_WITHOUT_DIRECTION();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should allow simple move without direction when target coord is empty', () => {
            const state: GipfState = GipfRules.get().getInitialState();
            const placement: GipfPlacement = new GipfPlacement(new Coord(6, 1), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            // This is diagram 2b in the rules of Gipf
            const expectedState: GipfState = new GipfState([
                [N, N, N, B, _, _, A],
                [N, N, _, _, _, _, A],
                [N, _, _, _, _, _, _],
                [A, _, _, _, _, _, B],
                [_, _, _, _, _, _, N],
                [_, _, _, _, _, N, N],
                [B, _, _, A, N, N, N],
            ], state.turn + 1, PlayerNumberMap.of(11, 12), state.capturedPieces);

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(placement, [], []);

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
            const expectedState: GipfState =
                new GipfState(expectedBoard, P1Turn, PlayerNumberMap.of(4, 5), PlayerNumberMap.of(0, 0));

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
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

                // Then the move should be illegal
                const reason: string = GipfFailure.PLACEMENT_ON_COMPLETE_LINE();
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6), MGPOptional.of(HexaDirection.LEFT));
            const move: GipfMove = new GipfMove(placement, [], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.INVALID_PLACEMENT_DIRECTION();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should force to capture consecutive pieces', () => {
            // This is diagram 4 in the rules of Gipf
            const linesCapturesAndResults: [FourStatePiece[], number[], FourStatePiece[], number, number][] = [
                [[B, B, B, B, _, B, A], [0, 1, 2, 3], [_, _, _, _, _, B, A], 0, 4],
                [[B, B, B, B, A, _, A], [0, 1, 2, 3, 4], [_, _, _, _, _, _, A], 1, 4],
                [[B, A, B, B, B, B, _], [0, 1, 2, 3, 4, 5], [_, _, _, _, _, _, _], 1, 5],
                [[A, B, B, B, B, A, B], [0, 1, 2, 3, 4, 5, 6], [_, _, _, _, _, _, _], 2, 5],
            ];
            for (const [line, capturePositions, resultingLine, capturedOpponent, capturedSelf]
                of linesCapturesAndResults) {
                const board: Table<FourStatePiece> = [
                    [N, N, N, _, _, _, _],
                    [N, N, _, _, _, _, _],
                    [N, _, _, _, _, _, _],
                    line,
                    [_, _, _, _, _, _, N],
                    [_, _, _, _, _, N, N],
                    [_, _, _, _, N, N, N],
                ];
                const state: GipfState =
                    new GipfState(board, P1Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
                const capture: GipfCapture = new GipfCapture(capturePositions.map((q: number) => new Coord(q, 3)));
                const placement: GipfPlacement = new GipfPlacement(new Coord(3, 0), MGPOptional.empty());
                const move: GipfMove = new GipfMove(placement, [capture], []);
                const expectedBoard: Table<FourStatePiece> = [
                    [N, N, N, B, _, _, _],
                    [N, N, _, _, _, _, _],
                    [N, _, _, _, _, _, _],
                    resultingLine,
                    [_, _, _, _, _, _, N],
                    [_, _, _, _, _, N, N],
                    [_, _, _, _, N, N, N],
                ];
                const expectedState: GipfState = new GipfState(expectedBoard,
                                                               P1Turn + 1,
                                                               PlayerNumberMap.of(5, 4 + capturedSelf),
                                                               PlayerNumberMap.of(0, capturedOpponent));
                RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const firstPlacement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                                    MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(firstPlacement, [], []);
            const firstLegality: MGPFallible<GipfLegalityInformation> = rules.isLegal(move, state);
            expect(firstLegality.isSuccess()).toBeTrue();

            const resultingState: GipfState =
                rules.applyLegalMove(move, state, defaultConfig, firstLegality.get());
            const placement: GipfPlacement = new GipfPlacement(new Coord(2, 6),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));

            const moveWithoutCapture: GipfMove = new GipfMove(placement, [], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.MISSING_CAPTURES();
            RulesUtils.expectMoveFailure(rules, resultingState, moveWithoutCapture, reason, defaultConfig);

            const capture: GipfCapture = new GipfCapture([
                new Coord(2, 3), new Coord(3, 3), new Coord(4, 3), new Coord(5, 3), new Coord(6, 3),
            ]);
            const moveWithCapture: GipfMove = new GipfMove(placement, [capture], []);
            const captureLegality: MGPFallible<GipfLegalityInformation> =
                rules.isLegal(moveWithCapture, resultingState);
            expect(captureLegality.isSuccess()).toBeTrue();
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
            const state: GipfState = new GipfState(board, P1Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));

            const placement: GipfPlacement = new GipfPlacement(new Coord(3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));

            const capture1: GipfCapture = new GipfCapture([
                new Coord(0, 3), new Coord(1, 3), new Coord(2, 3), new Coord(3, 3), new Coord(4, 3),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 4), new Coord(2, 3),
            ]);

            const moveWithoutCapture: GipfMove = new GipfMove(placement, [], []);

            // Then the move should be illegal
            let reason: string = GipfFailure.MISSING_CAPTURES();
            RulesUtils.expectMoveFailure(rules, state, moveWithoutCapture, reason, defaultConfig);

            const moveWithCapture1: GipfMove = new GipfMove(placement, [capture1], []);
            const capture1Legality: MGPFallible<GipfLegalityInformation> = rules.isLegal(moveWithCapture1, state);
            expect(capture1Legality.isSuccess()).toBeTrue();

            const moveWithCapture2: GipfMove = new GipfMove(placement, [capture2], []);
            const capture2Legality: MGPFallible<GipfLegalityInformation> = rules.isLegal(moveWithCapture2, state);
            expect(capture2Legality.isSuccess()).toBeTrue();

            const moveWithBothCaptures: GipfMove = new GipfMove(placement, [capture1, capture2], []);

            // Then the move should be illegal
            reason = GipfFailure.CAPTURE_MUST_BE_ALIGNED();
            RulesUtils.expectMoveFailure(rules, state, moveWithBothCaptures, reason, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));

            const placementA: GipfPlacement = new GipfPlacement(new Coord(0, 4),
                                                                MGPOptional.of(HexaDirection.RIGHT));

            const moveANoCapture: GipfMove = new GipfMove(placementA, [], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.MISSING_CAPTURES();
            RulesUtils.expectMoveFailure(rules, state, moveANoCapture, reason, defaultConfig);

            const captureA: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 4), new Coord(2, 3), new Coord(2, 2),
            ]);

            const moveA: GipfMove = new GipfMove(placementA, [], [captureA]);

            const legalityA: MGPFallible<GipfLegalityInformation> = rules.isLegal(moveA, state);
            expect(legalityA.isSuccess()).toBeTrue();

            const resultingState: GipfState = rules.applyLegalMove(moveA, state, defaultConfig, legalityA.get());

            const placementB: GipfPlacement = new GipfPlacement(new Coord(3, 0),
                                                                MGPOptional.of(HexaDirection.RIGHT));
            const moveBNoCapture: GipfMove = new GipfMove(placementB, [], []);

            // Then the move should be illegal
            RulesUtils.expectMoveFailure(rules, resultingState, moveBNoCapture, reason, defaultConfig);

            const captureB: GipfCapture = new GipfCapture([
                new Coord(3, 4), new Coord(4, 3), new Coord(5, 2), new Coord(6, 1),
            ]);
            const moveB: GipfMove = new GipfMove(placementB, [captureB], []);

            const legalityB: MGPFallible<GipfLegalityInformation> = rules.isLegal(moveB, resultingState);
            expect(legalityB.isSuccess()).toBeTrue();
        });

        it('should not allow invalid initial captures (too short)', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, A],
                [N, N, _, _, _, B, B],
                [N, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, A, _, _, _, N],
                [_, _, A, _, _, N, N],
                [_, A, A, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));

            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 1),
                                                               MGPOptional.of(HexaDirection.RIGHT));
            const capture: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 3), new Coord(2, 4),
            ]);
            const move: GipfMove = new GipfMove(placement, [capture], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.INVALID_CAPTURED_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should not allow capture with holes', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, _, _, A],
                [N, N, _, _, _, B, B],
                [N, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, A, _, _, _, N],
                [_, _, _, _, _, N, N],
                [_, A, A, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));

            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 1),
                                                               MGPOptional.of(HexaDirection.RIGHT));

            const capture: GipfCapture = new GipfCapture([
                new Coord(2, 3), new Coord(2, 4), new Coord(2, 5), new Coord(2, 6),
            ]);
            const move: GipfMove = new GipfMove(placement, [capture], []);

            // Then the move should be illegal
            const reason: string = GipfFailure.CAPTURE_MUST_BE_ALIGNED();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));

            const placement: GipfPlacement = new GipfPlacement(new Coord(0, 4),
                                                               MGPOptional.of(HexaDirection.RIGHT));
            const capture: GipfCapture = new GipfCapture([
                new Coord(2, 6), new Coord(2, 5), new Coord(2, 3), new Coord(2, 4),
            ]);
            const move: GipfMove = new GipfMove(placement, [], [capture]);

            // Then the move should be illegal
            const reason: string = GipfFailure.INVALID_CAPTURED_PIECES();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(5, 5), PlayerNumberMap.of(0, 0));
            const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(placement, [], []);

            const expectedBoard: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, A],
                [N, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, N],
                [B, _, B, _, _, N, N],
                [_, A, _, _, N, N, N],
            ];
            const expectedState: GipfState =
                new GipfState(expectedBoard, P1Turn, PlayerNumberMap.of(4, 5), PlayerNumberMap.of(0, 0));

            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('applyPlacement', () => {

        it('should not allow applying placements where a piece already is no direction is given', () => {
            const state: GipfState = GipfRules.get().getInitialState();
            const placement: GipfPlacement = new GipfPlacement(new Coord(6, 3), MGPOptional.empty());
            expect(() => GipfRules.applyPlacement(placement, state)).toThrow();
        });

    });

    describe('game status', () => {
        const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6),
                                                           MGPOptional.of(HexaDirection.UP_RIGHT));
        const dummyMove: GipfMove = new GipfMove(placement, [], []);

        it('should declare victory when one player does not have any piece left (Player.ZERO)', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P1Turn, PlayerNumberMap.of(5, 0), PlayerNumberMap.of(0, 0));
            const node: GipfNode = new GipfNode(state, MGPOptional.empty(), MGPOptional.of(dummyMove));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should declare victory when one player does not have any piece left (Player.ONE)', () => {
            const board: Table<FourStatePiece> = [
                [N, N, N, _, A, _, _],
                [N, N, _, _, A, _, _],
                [N, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, N],
                [B, _, B, _, _, N, N],
                [_, B, _, _, N, N, N],
            ];
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(0, 5), PlayerNumberMap.of(0, 0));
            const node: GipfNode = new GipfNode(state, MGPOptional.empty(), MGPOptional.of(dummyMove));
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
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
            const state: GipfState = new GipfState(board, P0Turn, PlayerNumberMap.of(0, 5), PlayerNumberMap.of(0, 0));
            const node: GipfNode = new GipfNode(state, MGPOptional.empty(), MGPOptional.of(dummyMove));
            // Then it should be considered as ongoing
            RulesUtils.expectToBeOngoing(rules, node, defaultConfig);
        });

    });

    describe('getAllDirectionsForEntrance', () => {

        it('should fail on non-entrances', () => {
            expect(() => GipfRules.getAllDirectionsForEntrance(GipfRules.get().getInitialState(), new Coord(3, 3)))
                .toThrow();
        });

    });

});
