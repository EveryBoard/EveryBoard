import { Coord } from 'src/app/jscaip/coord/Coord';
import { HexaBoard } from 'src/app/jscaip/hexa/HexaBoard';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { GipfLegalityStatus } from '../gipf-legality-status/GipfLegalityStatus';
import { GipfCapture, GipfMove, GipfPlacement } from '../gipf-move/GipfMove';
import { GipfPartSlice } from '../gipf-part-slice/GipfPartSlice';
import { GipfPiece } from '../gipf-piece/GipfPiece';
import { GipfRules } from './GipfRules';

describe('GipfRules:', () => {
    // Rules of gipf with the diagrams used in these tests: http://www.gipf.com/gipf/rules/complete_rules.html
    // We are using the tournament rules
    const __: GipfPiece = GipfPiece.EMPTY;
    const A1: GipfPiece = GipfPiece.PLAYER_ZERO_SIMPLE;
    const A2: GipfPiece = GipfPiece.PLAYER_ZERO_DOUBLE;
    const B1: GipfPiece = GipfPiece.PLAYER_ONE_SIMPLE;
    const B2: GipfPiece = GipfPiece.PLAYER_ONE_DOUBLE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    describe('basic variant', () => {
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
                [__, __, __, B1, __, __, A1],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [A1, __, __, __, __, __, B1],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [B1, __, __, A1, __, __, __],
            ], __, GipfPiece.encoder);
            board.forEachCoord((c: Coord, content: GipfPiece) => {
                expect(content).toEqual(expectedBoard.getAt(c));
            });
        });

        it('should allow simple moves without captures when possible', () => {
            // This is diagram 2a in the rules of Gipf
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [__, __, __, __, A1, __, __],
                [__, __, __, __, A1, __, __],
                [__, __, __, __, __, A1, __],
                [A1, B1, A1, __, B1, __, __],
                [A1, __, __, A1, B1, B1, __],
                [B1, __, B1, __, __, __, __],
                [__, B1, __, __, __, __, __],
            ], __, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn,
                                                           [5, 5], [false, false], [0, 0]);
            const placement: GipfPlacement = new GipfPlacement(new Coord(-2, +3), HexaDirection.UP_RIGHT, false);
            const move: GipfMove = new GipfMove(placement, [], []);

            const legality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(legality.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(move, slice, legality).resultingSlice;

            // This is diagram 2b in the rules of Gipf
            const expectedBoard: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [__, __, __, __, A1, __, __],
                [__, __, __, __, A1, __, A1],
                [__, __, __, __, __, B1, __],
                [A1, B1, A1, __, A1, __, __],
                [A1, __, __, B1, B1, B1, __],
                [B1, __, B1, __, __, __, __],
                [__, A1, __, __, __, __, __],
            ], __, GipfPiece.encoder);
            const expectedSlice: GipfPartSlice = new GipfPartSlice(expectedBoard, P1Turn,
                                                                   [4, 5], [false, false], [0, 0]);

            expect(resultingSlice.equals(expectedSlice)).toBeTrue();
        });
        it('should not allow placements on blocked lines', () => {
            // This is diagram 3
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [__, __, __, B1, B1, B1, A1],
                [__, __, __, __, __, __, A1],
                [__, __, __, __, __, A1, __],
                [A1, B1, A1, A1, B1, B1, A1],
                [__, B1, __, A1, __, __, __],
                [B1, A1, B1, B1, __, __, __],
                [__, A1, __, __, __, __, __],
            ], __, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn,
                                                           [5, 5], [false, false], [0, 0]);
            const invalidPlacements: GipfPlacement[] = [
                new GipfPlacement(new Coord(0, -3), HexaDirection.DOWN_RIGHT, false),
                new GipfPlacement(new Coord(-3, 3), HexaDirection.UP_LEFT, false),
                new GipfPlacement(new Coord(-3, 3), HexaDirection.DOWN_LEFT, false),
                new GipfPlacement(new Coord(-3, 0), HexaDirection.DOWN_RIGHT, false),
                new GipfPlacement(new Coord(3, 0), HexaDirection.UP_RIGHT, false),
                new GipfPlacement(new Coord(-2, 3), HexaDirection.UP_RIGHT, false),
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
                [[B1, B1, B1, B1, __, B1, A1], [0, 1, 2, 3]],
                [[B1, B1, B1, B1, A1, __, A1], [0, 1, 2, 3, 4]],
                [[B1, A1, B1, B1, B1, B1, __], [0, 1, 2, 3, 4, 5]],
                [[A1, B1, B1, B1, B1, A1, B1], [0, 1, 2, 3, 4, 5, 6]],
            ];
            for (const [line, capturePositions] of linesAndCaptures) {
                const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                    [__, __, __, __, __, __, __],
                    [__, __, __, __, __, __, __],
                    [__, __, __, __, __, __, __],
                    line,
                    [__, __, __, __, __, __, __],
                    [__, __, __, __, __, __, __],
                    [__, __, __, __, __, __, __],
                ], __, GipfPiece.encoder);
                const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn,
                                                               [5, 5], [false, false], [0, 0]);
                const capture: GipfCapture = new GipfCapture(capturePositions.map((q: number) => new Coord(-3+q, 0)));
                const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, -3),
                                                                      HexaDirection.DOWN_RIGHT, false),
                                                    [capture],
                                                    []);
                const legality: GipfLegalityStatus = rules.isLegal(move, slice);
                expect(legality.legal.isSuccess()).toBeTrue();
            }
        });
        it('should force to capture when possible', () => {
            // This is diagram 5a
            const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
                [__, __, __, B1, __, B1, B1],
                [__, __, __, __, B1, A1, __],
                [__, __, __, __, B1, B1, __],
                [B1, __, B1, B1, A1, B1, B1],
                [__, __, A1, B1, __, __, __],
                [__, B1, A1, __, __, __, __],
                [A1, A1, __, __, __, __, __],
            ], __, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn,
                                                           [5, 5], [false, false], [0, 0]);
            const firstPlacement: GipfPlacement = new GipfPlacement(new Coord(-2, 3), HexaDirection.UP_RIGHT, false);
            const move: GipfMove = new GipfMove(firstPlacement, [], []);
            const firstLegality: GipfLegalityStatus = rules.isLegal(move, slice);
            expect(firstLegality.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(move, slice, firstLegality).resultingSlice;
            const placement: GipfPlacement = new GipfPlacement(new Coord(-1, 3), HexaDirection.UP_RIGHT, false);

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
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, A1, __, A1, __],
                [B1, B1, B1, B1, B1, __, __],
                [__, A1, B1, __, __, __, __],
                [A1, __, B1, __, __, __, __],
                [__, __, B1, __, __, __, __],
            ], __, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn,
                                                           [5, 5], [false, false], [0, 0]);

            const placement: GipfPlacement = new GipfPlacement(new Coord(0, -3), HexaDirection.DOWN, false);


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
                [__, __, __, __, __, __, A1],
                [__, __, __, __, __, B1, B1],
                [__, __, B1, __, __, B1, __],
                [__, __, A1, __, B1, __, __],
                [B1, A1, B1, __, __, __, __],
                [__, __, A1, __, __, __, __],
                [__, A1, A1, __, __, __, __],
            ], __, GipfPiece.encoder);
            const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn,
                                                           [5, 5], [false, false], [0, 0]);

            const placementA: GipfPlacement = new GipfPlacement(new Coord(-3, 1), HexaDirection.DOWN_RIGHT, false);
            const captureA: GipfCapture = new GipfCapture([
                new Coord(-1, 3), new Coord(-1, 2), new Coord(-1, 0), new Coord(-1, 1),
            ]);
            const moveA: GipfMove = new GipfMove(placementA, [], [captureA]);

            const legalityA: GipfLegalityStatus = rules.isLegal(moveA, slice);
            expect(legalityA.legal.isSuccess()).toBeTrue();

            const resultingSlice: GipfPartSlice = rules.applyLegalMove(moveA, slice, legalityA).resultingSlice;

            const placementB: GipfPlacement = new GipfPlacement(new Coord(0, -3), HexaDirection.DOWN_RIGHT, false);
            const captureB: GipfCapture = new GipfCapture([
                new Coord(0, 1), new Coord(1, 0), new Coord(2, -1), new Coord(3, -2),
            ]);
            const moveB: GipfMove = new GipfMove(placementB, [captureB], []);

            const legalityB: GipfLegalityStatus = rules.isLegal(moveB, resultingSlice);
            expect(legalityB.legal.isSuccess()).toBeTrue();
        });
    });
//    it('can leave double piece out of the capture', () => {
//        // This is diagram 8
//        const board: HexaBoard<GipfPiece> = HexaBoard.fromTable([
//            [__, __, __, A2, __, __, __],
//            [__, __, __, B2, __, __, A1],
//            [__, B1, B1, B1, A1, A2, A1],
//            [__, __, __, A1, B2, B1, __],
//            [__, __, __, A1, B1, __, __],
//            [__, B2, B1, A2, __, __, __],
//            [A1, __, A1, A1, __, __, __],
//        ], __, GipfPiece.encoder);
//    });

});
