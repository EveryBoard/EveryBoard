import { Arrow, GipfComponent, GipfComponentFailure } from '../gipf.component';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { GipfFailure } from 'src/app/games/gipf/GipfRules';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { JSONValue } from 'src/app/utils/utils/utils';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GipfPiece } from 'src/app/games/gipf/GipfPiece';
import { GipfCapture, GipfMove, GipfPlacement } from 'src/app/games/gipf/GipfMove';
import { GipfBoard } from 'src/app/games/gipf/GipfBoard';
import { GipfPartSlice } from 'src/app/games/gipf/GipfPartSlice';

describe('GipfComponent', () => {
    let componentTestUtils: ComponentTestUtils<GipfComponent>;

    const _: GipfPiece = GipfPiece.EMPTY;
    const A: GipfPiece = GipfPiece.PLAYER_ZERO;
    const B: GipfPiece = GipfPiece.PLAYER_ONE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<GipfComponent>('Gipf');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('GipfComponent should be created');
    });
    it('should fail on selecting an invalid direction', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_3_6');
        await componentTestUtils.expectClickFailure('#click_4_4', GipfFailure.INVALID_PLACEMENT_DIRECTION);
    }));
    it('should allow placement directly resulting in a move if there is no initial capture', fakeAsync(async() => {
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()), [], []);
        await componentTestUtils.expectMoveSuccess('#click_0_4', move);
    }));
    it('should not accept selecting a non-border coord for placement', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_3_3', GipfFailure.PLACEMENT_NOT_ON_BORDER);
    }));
    it('should show possible directions after selecting an occupied placement coord', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_3');
        expect(componentTestUtils.getComponent().arrows.length).toBe(3);
        expect(componentTestUtils.getComponent().arrows.some((arrow: Arrow) => {
            return arrow.source.equals(new Coord(6, 3)) && arrow.destination.equals(new Coord(5, 3));
        }));
        expect(componentTestUtils.getComponent().arrows.some((arrow: Arrow) => {
            return arrow.source.equals(new Coord(6, 3)) && arrow.destination.equals(new Coord(5, 4));
        }));
        expect(componentTestUtils.getComponent().arrows.some((arrow: Arrow) => {
            return arrow.source.equals(new Coord(6, 3)) && arrow.destination.equals(new Coord(6, 2));
        }));
    }));
    it('should not accept selecting something else than one of the proposed direction', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_6_3');
        await componentTestUtils.expectClickFailure('#click_3_3', GipfComponentFailure.CLICK_FURTHER_THAN_ONE_COORD);
    }));
    it('should not allow clicking on anything else than a capture if there is one in the initial captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickFailure('#click_6_3', GipfComponentFailure.NOT_PART_OF_CAPTURE);
    }));
    it('should highlight initial captures directly', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_3_3');

        componentTestUtils.expectElementToHaveClasses('#click_3_2', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#click_3_3', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#click_3_4', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#click_3_5', ['base', 'captured']);
    }));
    it('should make pieces disappear upon selection of a capture', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 2))).toBeFalse();
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 3))).toBeFalse();
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 4))).toBeFalse();
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 5))).toBeFalse();
    }));
    it('should accept placing after performing initial captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);
        await componentTestUtils.expectMoveSuccess('#click_0_4', move);
    }));
    it('should not allow capturing from a coord that is part of intersecting captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, B, B, B, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickFailure('#click_2_3', GipfComponentFailure.AMBIGUOUS_CAPTURE_COORD);
    }));
    it('should not allow clicking on anything else than a capture if there is one in the final captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        // Perform the placement to prepare for final capture
        await componentTestUtils.expectClickSuccess('#click_0_3');
        await componentTestUtils.expectClickSuccess('#click_1_3');
        await componentTestUtils.expectClickFailure('#click_3_3', GipfComponentFailure.NOT_PART_OF_CAPTURE);
    }));
    it('should perform move after final captures has been done', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, _],
            [A, _, B, _, _, _, _],
            [_, _, B, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P1Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_0_3');
        await componentTestUtils.expectClickSuccess('#click_1_3');

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 3),
                                                              MGPOptional.of(HexaDirection.DOWN_RIGHT)),
                                            [],
                                            [new GipfCapture([
                                                new Coord(2, 3), new Coord(2, 4), new Coord(2, 5), new Coord(2, 6),
                                            ])]);

        await componentTestUtils.expectMoveSuccess('#click_2_3', move);
    }));
    it('should highlight moved pieces only', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, _, _, A, _],
            [_, _, _, _, B, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, _, _, _, _],
            [_, B, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6), MGPOptional.of(HexaDirection.UP_RIGHT));
        const move: GipfMove = new GipfMove(placement, [], []);
        await componentTestUtils.expectClickSuccess('#click_1_6');
        await componentTestUtils.expectMoveSuccess('#click_2_5', move);

        expect(componentTestUtils.getComponent().getCaseClass(new Coord(1, 6))).toEqual('moved');
        expect(componentTestUtils.getComponent().getCaseClass(new Coord(2, 5))).toEqual('moved');
        expect(componentTestUtils.getComponent().getCaseClass(new Coord(3, 4))).not.toEqual('moved');
    }));
    it('should highlight capturable pieces', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        expect(componentTestUtils.getComponent().possibleCaptures).toContain(new GipfCapture([
            new Coord(3, 2),
            new Coord(3, 3),
            new Coord(3, 4),
            new Coord(3, 5),
        ]));
    }));
    it('should highlight captured pieces positions', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);

        await componentTestUtils.expectMoveSuccess('#click_0_4', move);

        componentTestUtils.expectElementToHaveClasses('#click_3_2', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#click_3_3', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#click_3_4', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#click_3_5', ['base', 'captured']);
    }));
    it('should update the number of pieces available', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, _],
            [_, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, _],
            [_, _, B, A, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);

        await componentTestUtils.expectMoveSuccess('#click_0_4', move);

        expect(componentTestUtils.getComponent().getPlayerSidePieces(0).length).toBe(8);
        expect(componentTestUtils.getComponent().getPlayerSidePieces(1).length).toBe(5);
    }));
    it('should not accept placement on a complete line', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, A, _, B],
            [_, _, _, _, _, A, _],
            [_, _, _, _, B, _, _],
            [_, _, _, A, _, _, _],
            [_, _, B, _, _, _, _],
            [_, B, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_1_6');
        expect(componentTestUtils.getComponent().arrows.length).toBe(1);
        await componentTestUtils.expectClickFailure('#click_2_5', GipfFailure.PLACEMENT_ON_COMPLETE_LINE);
    }));
    it('should accept moves with two initial captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(6, 3),
                                                              MGPOptional.empty()),
                                            [
                                                new GipfCapture([
                                                    new Coord(4, 4), new Coord(4, 3),
                                                    new Coord(4, 2), new Coord(4, 1),
                                                ]),
                                                new GipfCapture([
                                                    new Coord(2, 4), new Coord(2, 3),
                                                    new Coord(2, 2), new Coord(2, 1),
                                                ]),
                                            ], []);

        await componentTestUtils.expectClickSuccess('#click_4_4');
        await componentTestUtils.expectClickSuccess('#click_2_4');
        await componentTestUtils.expectMoveSuccess('#click_6_3', move);
    }));
    it('should accept moves with two final captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, _, A, B, A, A],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(5, 4),
                                                              MGPOptional.of(HexaDirection.UP_LEFT)),
                                            [],
                                            [
                                                new GipfCapture([
                                                    new Coord(4, 4), new Coord(4, 3),
                                                    new Coord(4, 2), new Coord(4, 1),
                                                ]),
                                                new GipfCapture([
                                                    new Coord(2, 4), new Coord(2, 3),
                                                    new Coord(2, 2), new Coord(2, 1),
                                                ]),
                                            ]);

        await componentTestUtils.expectClickSuccess('#click_5_4'); // select placement coord
        await componentTestUtils.expectClickSuccess('#click_4_4'); // select direction
        await componentTestUtils.expectClickSuccess('#click_4_4'); // select first capture
        await componentTestUtils.expectMoveSuccess('#click_2_4', move); // select second capture
    }));
    it('should remove highlights and arrows upon move cancellation', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, _, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        await componentTestUtils.expectClickSuccess('#click_4_5');
        await componentTestUtils.expectClickSuccess('#click_4_4');
        await componentTestUtils.expectClickFailure('#click_3_3', GipfComponentFailure.NOT_PART_OF_CAPTURE);

        componentTestUtils.expectElementToHaveClasses('#click_4_5', ['base']);
        componentTestUtils.expectElementToHaveClasses('#click_3_3', ['base']);
        expect(componentTestUtils.getComponent().arrows.length).toBe(0);
    }));
    it('should recompute captures upon intersecting captures', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, A, _, _, A],
            [_, _, _, A, _, _, A],
            [_, A, A, _, A, B, A],
            [_, _, _, A, _, _, A],
            [_, _, _, A, _, _, _],
            [A, A, A, B, B, _, _],
            [_, _, _, A, _, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [8, 4], [2, 3]);
        componentTestUtils.setupSlice(slice);

        const move: GipfMove = new GipfMove(
            new GipfPlacement(new Coord(3, 6), MGPOptional.of(HexaDirection.UP)),
            [new GipfCapture([
                new Coord(6, 0),
                new Coord(6, 1),
                new Coord(6, 2),
                new Coord(6, 3),
            ])],
            [
                new GipfCapture([
                    new Coord(0, 5),
                    new Coord(1, 5),
                    new Coord(2, 5),
                    new Coord(3, 5),
                    new Coord(4, 5),
                ]),
                new GipfCapture([
                    new Coord(3, 0),
                    new Coord(3, 1),
                    new Coord(3, 2),
                    new Coord(3, 3),
                    new Coord(3, 4),
                ]),
            ],
        );
        await componentTestUtils.expectClickSuccess('#click_6_0'); // Initial capture
        await componentTestUtils.expectClickSuccess('#click_3_6'); // Placement coord
        await componentTestUtils.expectClickSuccess('#click_3_5'); // Placement direction
        await componentTestUtils.expectClickSuccess('#click_0_5'); // Final capture 1
        await componentTestUtils.expectMoveSuccess('#click_3_0', move); // Final capture 2
    }));
    it('should not allow selecting placement when no direction is valid', fakeAsync(async() => {
        const board: GipfBoard = GipfBoard.of([
            [_, _, _, _, _, _, B],
            [_, _, _, _, _, A, _],
            [B, _, _, _, B, _, _],
            [A, _, _, A, _, _, _],
            [B, _, B, _, _, _, _],
            [A, A, _, _, _, _, _],
            [B, A, B, A, B, _, _],
        ]);
        const slice: GipfPartSlice = new GipfPartSlice(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupSlice(slice);
        await componentTestUtils.expectClickFailure('#click_0_6', GipfComponentFailure.NO_DIRECTIONS_AVAILABLE);
    }));
    describe('encode/decode', () => {
        it('should delegate decoding to move', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));
            const move: GipfMove = new GipfMove(placement, [], []);
            const encodedMove: JSONValue = GipfMove.encoder.encode(move);
            spyOn(GipfMove.encoder, 'decode').and.callThrough();
            componentTestUtils.getComponent().decodeMove(encodedMove);
            expect(GipfMove.encoder.decode).toHaveBeenCalledTimes(1);
        });
        it('should delegate encoding to move', () => {
            const placement: GipfPlacement = new GipfPlacement(new Coord(-3, 0),
                                                               MGPOptional.of(HexaDirection.DOWN));
            const move: GipfMove = new GipfMove(placement, [], []);
            spyOn(GipfMove.encoder, 'encode').and.callThrough();
            componentTestUtils.getComponent().encodeMove(move);
            expect(GipfMove.encoder.encode).toHaveBeenCalledTimes(1);
        });
    });
});
