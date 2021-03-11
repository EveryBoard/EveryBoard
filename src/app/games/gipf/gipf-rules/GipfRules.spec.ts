import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { GipfLegalityStatus } from '../gipf-legality-status/GipfLegalityStatus';
import { GipfCapture, GipfMove, GipfPlacement } from '../gipf-move/GipfMove';
import { GipfPartSlice } from '../gipf-part-slice/GipfPartSlice';
import { GipfPiece } from '../gipf-piece/GipfPiece';
import { GipfRules, GipfNode } from './GipfRules';

describe('GipfRules:', () => {
    // Rules of gipf with the diagrams used in these tests: http://www.gipf.com/gipf/rules/complete_rules.html
    // We are using the tournament rules
    const _: GipfPiece = GipfPiece.EMPTY;
    const A: GipfPiece = GipfPiece.PLAYER_ZERO;
    const B: GipfPiece = GipfPiece.PLAYER_ONE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    let rules: GipfRules;

    beforeEach(() => {
        rules = new GipfRules(GipfPartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start at turn 0');
    });
    it('should start with the expected board for the basic variant', () => {
        const slice: GipfPartSlice = rules.node.gamePartSlice;
        const board: HexaBoard<GipfPiece> = slice.hexaBoard;
        const expectedBoard: HexaBoard<GipfPiece> = HexaBoard.fromTable([
            [_, _, _, B, _, _, A],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [A, _, _, _, _, _, B],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [B, _, _, A, _, _, _],
        ], _, GipfPiece.encoder);
        board.forEachCoord((c: Coord, content: GipfPiece) => {
            expect(content).toEqual(expectedBoard.getAt(c));
        });
    });
    describe('isLegal and applyLegalMove', () => {
        it('should forbit placements on non-border cases', () => {
            const slice: GipfPartSlice = rules.node.gamePartSlice;
            const placement: GipfPlacement = new GipfPlacement(new Coord(0, 0), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeFalse();
        });
        it('should require a direction when placing a piece on an occupied case', () => {
            const slice: GipfPartSlice = rules.node.gamePartSlice;
            const placement: GipfPlacement = new GipfPlacement(new Coord(0, -3), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeFalse();
        });
        it('should allow simple move without direction when target coord is empty', () => {
            const slice: GipfPartSlice = rules.node.gamePartSlice;
            const placement: GipfPlacement = new GipfPlacement(new Coord(3, -2), MGPOptional.empty());
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(move, slice, legality).resultingSlice;

            // This is diagram 2b in the rules of Gipf
            const expectedBoard: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, B, _, _, A],
                [_, _, _, _, _, _, A],
                [_, _, _, _, _, _, _],
                [A, _, _, _, _, _, B],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [B, _, _, A, _, _, _],
            ], _, GipfPiece.encoder);
            resultingSlice.hexaBoard.forEachCoord((c: Coord, content: GipfPiece) => {
                expect(content).toEqual(expectedBoard.getAt(c));
            });
        });

        it('should allow simple moves without captures when possible', () => {
            // This is diagram 2a in the rules of Gipf
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const placement: GipfPlacement = new GipfPlacement(new Coord(-2, +3), MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(move, slice, legality).resultingSlice;

            // This is diagram 2b in the rules of Gipf
            const expectedBoard: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, A],
                [_, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, _],
                [B, _, B, _, _, _, _],
                [_, A, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const expectedSlice: GipfPartSlice = new GipfPartSlice(expectedBoard, P1Turn, [4, 5], [0, 0]);

            expect(resultingSlice.equals(expectedSlice)).toBeTrue();
        });
        it('should not allow placements on blocked lines', () => {
            // This is diagram 3
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, B, B, B, A],
                [_, _, _, _, _, _, A],
                [_, _, _, _, _, A, _],
                [A, B, A, A, B, B, A],
                [_, B, _, A, _, _, _],
                [B, A, B, B, _, _, _],
                [_, A, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const invalidPlacements: GipfPlacement[] = [
                new GipfPlacement(new Coord(0, -3), MGPOptional.of(HexaDirection.DOWN_RIGHT)),
                new GipfPlacement(new Coord(-2, 3), MGPOptional.of(HexaDirection.UP_LEFT)),
                new GipfPlacement(new Coord(3, -2), MGPOptional.of(HexaDirection.DOWN_LEFT)),
                new GipfPlacement(new Coord(-3, 0), MGPOptional.of(HexaDirection.DOWN_RIGHT)),
                new GipfPlacement(new Coord(3, 0), MGPOptional.of(HexaDirection.UP_RIGHT)),
                new GipfPlacement(new Coord(-2, 3), MGPOptional.of(HexaDirection.UP_RIGHT)),
            ];
            for (const placement of invalidPlacements) {
                const move: GipfMove = new GipfMove(placement, [], []);
                const legality: GipfLegalityStatus = rules.isLegal(move, slice);
                expect(legality.legal.isSuccess()).toBeFalse();
            }
        });
        it('should force to capture consecutive pieces', () => {
            // This is diagram 4 in the rules of Gipf
            const linesAndCaptures: [GipfPiece[], number[]][] = [
                [[B, B, B, B, _, B, A], [0, 1, 2, 3]],
                [[B, B, B, B, A, _, A], [0, 1, 2, 3, 4]],
                [[B, A, B, B, B, B, _], [0, 1, 2, 3, 4, 5]],
                [[A, B, B, B, B, A, B], [0, 1, 2, 3, 4, 5, 6]],
            ];
            for (const [line, capturePositions] of linesAndCaptures) {
                const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    line,
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                    [_, _, _, _, _, _, _],
                ], _, GipfPiece.encoder);
                const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
                const capture: GipfCapture = new GipfCapture(capturePositions.map((q: number) => new Coord(-3+q, 0)));
                const placement: GipfPlacement = new GipfPlacement(new Coord(0, -3),
                                                                   MGPOptional.of(HexaDirection.DOWN_RIGHT));
                const move: GipfMove = new GipfMove(placement, [capture], []);
                const legality: GipfLegalityStatus = rules.isLegal(move, slice);
                expect(legality.legal.isSuccess()).toBeTrue();
            }
        });
        it('should force to capture when possible', () => {
            // This is diagram 5a
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, B, _, B, B],
                [_, _, _, _, B, A, _],
                [_, _, _, _, B, B, _],
                [B, _, B, B, A, B, B],
                [_, _, A, B, _, _, _],
                [_, B, A, _, _, _, _],
                [A, A, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const firstPlacement: GipfPlacement = new GipfPlacement(new Coord(-2, 3),
                                                                    MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(firstPlacement, [], []);
            const firstLegality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(firstLegality.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(move, slice, firstLegality).resultingSlice;
            const placement: GipfPlacement = new GipfPlacement(new Coord(-1, 3),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));

            const moveWithoutCapture: GipfMove = new GipfMove(placement, [], []);
            const noCaptureLegality: GipfLegalityStatus = rules.isLegal(moveWithoutCapture, resultingSlice);
            expect(noCaptureLegality.legal.isSuccess()).toBeFalse();

            const capture: GipfCapture = new GipfCapture([
                new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0),
            ]);
            const moveWithCapture: GipfMove = new GipfMove(placement, [capture], []);
            const captureLegality: GipfLegalityStatus = rules.isLegal(moveWithCapture, resultingSlice);
            expect(captureLegality.legal.isSuccess()).toBeTrue();
        });

        it('should let player choose between intersecting captures', () => {
            // This is diagram 6
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, A, _, A, _],
                [B, B, B, B, B, _, _],
                [_, A, B, _, _, _, _],
                [A, _, B, _, _, _, _],
                [_, _, B, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(0, -3),
                                                               MGPOptional.of(HexaDirection.DOWN));


            const capture1: GipfCapture = new GipfCapture([
                new Coord(-3, 0), new Coord(-2, 0), new Coord(-1, 0), new Coord(0, 0), new Coord(1, 0),
            ]);
            const capture2: GipfCapture = new GipfCapture([
                new Coord(-1, 3), new Coord(-1, 2), new Coord(-1, 1), new Coord(-1, 0),
            ]);

            const moveWithoutCapture: GipfMove = new GipfMove(placement, [], []);
            const noCaptureLegality: GipfLegalityStatus = rules.isLegal(moveWithoutCapture, slice);
            expect(noCaptureLegality.legal.isSuccess()).toBeFalse();

            const moveWithCapture1: GipfMove = new GipfMove(placement, [capture1], []);
            const capture1Legality: GipfLegalityStatus = rules.isLegal(moveWithCapture1, slice);
            expect(capture1Legality.legal.isSuccess()).toBeTrue();

            const moveWithCapture2: GipfMove = new GipfMove(placement, [capture2], []);
            const capture2Legality: GipfLegalityStatus = rules.isLegal(moveWithCapture2, slice);
            expect(capture2Legality.legal.isSuccess()).toBeTrue();

            const moveWithBothCaptures: GipfMove = new GipfMove(placement, [capture1, capture2], []);
            const capturesLegality: GipfLegalityStatus = rules.isLegal(moveWithBothCaptures, slice);
            expect(capturesLegality.legal.isSuccess()).toBeTrue();
        });
        it('should force both players to capture when possible', () => {
            // This is the board before diagram 7
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, A],
                [_, _, _, _, _, B, B],
                [_, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, B, _, _, _, _],
                [_, _, A, _, _, _, _],
                [_, A, A, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);

            const placementA: GipfPlacement = new GipfPlacement(new Coord(-3, 1),
                                                                MGPOptional.of(HexaDirection.DOWN_RIGHT));

            const moveANoCapture: GipfMove = new GipfMove(placementA, [], []);
            expect(rules.isLegal(moveANoCapture, slice).legal.isSuccess()).toBeFalse();

            const captureA: GipfCapture = new GipfCapture([
                new Coord(-1, 3), new Coord(-1, 2), new Coord(-1, 1), new Coord(-1, 0), new Coord(-1, -1),
            ]);

            const moveA: GipfMove = new GipfMove(placementA, [], [captureA]);

            const legalityA: GipfLegalityStatus = rules.isLegal(moveA, slice);
            expect(legalityA.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(moveA, slice, legalityA).resultingSlice;

            const placementB: GipfPlacement = new GipfPlacement(new Coord(0, -3),
                                                                MGPOptional.of(HexaDirection.DOWN_RIGHT));
            const moveBNoCapture: GipfMove = new GipfMove(placementB, [], []);
            expect(rules.isLegal(moveBNoCapture, resultingSlice).legal.isSuccess()).toBeFalse();

            const captureB: GipfCapture = new GipfCapture([
                new Coord(0, 1), new Coord(1, 0), new Coord(2, -1), new Coord(3, -2),
            ]);
            const moveB: GipfMove = new GipfMove(placementB, [captureB], []);

            const legalityB: GipfLegalityStatus = rules.isLegal(moveB, resultingSlice);
            expect(legalityB.legal.isSuccess()).toBeTrue();
        });
        it('should not allow invalid initial captures', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, A],
                [_, _, _, _, _, B, B],
                [_, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, A, _, _, _, _],
                [_, _, A, _, _, _, _],
                [_, A, A, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 1),
                                                               MGPOptional.of(HexaDirection.DOWN_RIGHT));
            const capture1: GipfCapture = new GipfCapture([
                new Coord(-1, 3), new Coord(-1, 2), new Coord(-1, 0), new Coord(-1, 1),
            ]);
            const move1: GipfMove = new GipfMove(placement, [capture1], []);
            const legality1: GipfLegalityStatus = rules.isLegal(move1, slice);
            expect(legality1.legal.isSuccess()).toBeFalse();

            const capture2: GipfCapture = new GipfCapture([
                new Coord(-2, 3), new Coord(-2, 2), new Coord(-2, 0), new Coord(-2, 1),
            ]);
            const move2: GipfMove = new GipfMove(placement, [capture2], []);
            const legality2: GipfLegalityStatus = rules.isLegal(move2, slice);
            expect(legality2.legal.isSuccess()).toBeFalse();
        });
        it('should not allow invalid final captures', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, A],
                [_, _, _, _, _, B, B],
                [_, _, B, _, _, B, _],
                [_, _, A, _, B, _, _],
                [B, A, B, _, _, _, _],
                [_, _, A, _, _, _, _],
                [_, A, A, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 1),
                                                               MGPOptional.of(HexaDirection.DOWN_RIGHT));
            const capture: GipfCapture = new GipfCapture([
                new Coord(-1, 3), new Coord(-1, 2), new Coord(-1, 0), new Coord(-1, 1),
            ]);
            const move: GipfMove = new GipfMove(placement, [], [capture]);
            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeFalse();
        });
        it('should correctly apply move even if the results are not cached in the legality status', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const placement: GipfPlacement = new GipfPlacement(new Coord(-2, +3),
                                                               MGPOptional.of(HexaDirection.UP_RIGHT));
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice =
                rules.applyLegalMove(move, slice, new GipfLegalityStatus(MGPValidation.SUCCESS, null)).resultingSlice;

            const expectedBoard: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, A],
                [_, _, _, _, _, B, _],
                [A, B, A, _, A, _, _],
                [A, _, _, B, B, B, _],
                [B, _, B, _, _, _, _],
                [_, A, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const expectedSlice: GipfPartSlice = new GipfPartSlice(expectedBoard, P1Turn, [4, 5], [0, 0]);

            expect(resultingSlice.equals(expectedSlice)).toBeTrue();
        });
    });
    describe('applyPlacement', () => {
        it('should not allow applying placements where a piece already is no direction is given', () => {
            const slice: GipfPartSlice = rules.node.gamePartSlice;
            const placement: GipfPlacement = new GipfPlacement(new Coord(3, -3), MGPOptional.empty());
            expect(() => rules.applyPlacement(slice, placement)).toThrow();
        });
    });
    describe('getListMoves', () => {
        it('should have 30 moves on the initial slice', () => {
            expect(rules.getListMoves(rules.node).size()).toBe(30);
        });
        it('should have 0 moves on a victory slice', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [0, 5], [0, 0]);
            const node: GipfNode = new GipfNode(null, null, slice, 0);
            expect(rules.getListMoves(node).size()).toBe(0);
        });
        it('should have 19 moves on an example slice with non-intersecting capture', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, _],
                [_, _, A, A, A, A, _],
                [_, _, _, _, _, A, _],
                [_, A, A, A, A, _, _],
                [_, _, _, A, B, B, _],
                [_, _, B, A, _, _, _],
                [_, _, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(null, null, slice, 0);
            expect(rules.getListMoves(node).size()).toBe(19);
        });
        it('should have 20 moves on an example slice with a complete line', () => {
            // 16 simple moves and 4 diagonal ones on the occupied borders
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, A, _, _, _],
                [_, _, _, B, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, B, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, B, _, _, _],
                [_, _, _, A, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(null, null, slice, 0);
            expect(rules.getListMoves(node).size()).toBe(20);
        });
        it('should have 30 moves on an example slice with all borders occupied', () => {
            // 16 simple moves and 4 diagonal ones on the occupied borders
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, A, B, A, B],
                [_, _, B, _, _, _, A],
                [_, A, _, _, _, _, B],
                [B, _, _, _, _, _, A],
                [A, _, _, _, _, B, _],
                [B, _, _, _, A, _, _],
                [A, B, A, B, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(null, null, slice, 0);
            expect(rules.getListMoves(node).size()).toBe(30);
        });
        it('should have 38 moves on an example slice with intersecting captures', () => {
            // There are 19 valid placements, each can be played with one of 2 captures
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, A, _, A, _],
                [_, A, A, A, A, _, _],
                [_, _, _, A, B, B, _],
                [_, _, B, A, _, _, _],
                [_, _, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
            const node: GipfNode = new GipfNode(null, null, slice, 0);
            expect(rules.getListMoves(node).size()).toBe(38);
        });
    });
    describe('getBoardValue', () => {
        const placement: GipfPlacement = new GipfPlacement(new Coord(-2, +3),
                                                           MGPOptional.of(HexaDirection.UP_RIGHT));
        const dummyMove: GipfMove = new GipfMove(placement, [], []);
        it('should declare victory when one player does not have any piece left', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice1: GipfPartSlice = new GipfPartSlice(board, P0Turn, [0, 5], [0, 0]);
            expect(rules.getBoardValue(dummyMove, slice1)).toEqual(Number.MAX_SAFE_INTEGER,
                                                                   'This should be a victory for player 1');
            const slice2: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 0], [0, 0]);
            expect(rules.getBoardValue(dummyMove, slice2)).toEqual(Number.MIN_SAFE_INTEGER,
                                                                   'This should be a victory for player 0');
        });
        it('should favor having captured pieces', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 7]);
            expect(rules.getBoardValue(dummyMove, slice)).toBeLessThan(0);
        });
        it('should favor having pieces to play pieces', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, A, _, _],
                [_, _, _, _, A, _, _],
                [_, _, _, _, _, A, _],
                [A, B, A, _, B, _, _],
                [A, _, _, A, B, B, _],
                [B, _, B, _, _, _, _],
                [_, B, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 7], [0, 0]);
            expect(rules.getBoardValue(dummyMove, slice)).toBeLessThan(0);
        });
        it('should not declare victory when one player does not have pieces left but still has an initial capture', () => {
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, A, _, _, _],
                [_, _, _, _, _, _, _],
            ], _, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [0, 5], [0, 0]);
            expect(rules.getBoardValue(dummyMove, slice)).toBeLessThan(Number.MAX_SAFE_INTEGER);
            expect(rules.getBoardValue(dummyMove, slice)).toBeGreaterThan(Number.MIN_SAFE_INTEGER);
        });
    });
    describe('getAllDirectionsForEntrance', () => {
        it('should fail on non-entrances', () => {
            expect(() => rules.getAllDirectionsForEntrance(rules.node.gamePartSlice, new Coord(0, 0))).toThrow();
        });
    });
});
