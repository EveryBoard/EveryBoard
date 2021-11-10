import { GipfComponent } from '../gipf.component';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GipfFailure } from 'src/app/games/gipf/GipfFailure';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { GipfCapture, GipfMove, GipfPlacement } from 'src/app/games/gipf/GipfMove';
import { GipfState } from 'src/app/games/gipf/GipfState';
import { Arrow } from 'src/app/jscaip/Arrow';
import { Table } from 'src/app/utils/ArrayUtils';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';

describe('GipfComponent', () => {

    let componentTestUtils: ComponentTestUtils<GipfComponent>;

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.NONE;
    const A: FourStatePiece = FourStatePiece.ZERO;
    const B: FourStatePiece = FourStatePiece.ONE;
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<GipfComponent>('Gipf');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('GipfComponent should be created').toBeTruthy();
    });
    it('should fail on selecting an invalid direction', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_3_6');
        await componentTestUtils.expectClickFailure('#click_4_4', GipfFailure.INVALID_PLACEMENT_DIRECTION());
    }));
    it('should allow placement directly resulting in a move if there is no initial capture', fakeAsync(async() => {
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()), [], []);
        await componentTestUtils.expectMoveSuccess('#click_0_4', move, undefined, [0, 0]);
    }));
    it('should not accept selecting a non-border coord for placement', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_3_3', GipfFailure.PLACEMENT_NOT_ON_BORDER());
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
        await componentTestUtils.expectClickFailure('#click_3_3', GipfFailure.CLICK_FURTHER_THAN_ONE_COORD());
    }));
    it('should not allow clicking on anything else than a capture if there is one in the initial captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, N],
            [_, _, B, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_6_3', GipfFailure.MISSING_CAPTURES());
    }));
    it('should highlight initial captures directly', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, _, _, _],
            [N, _, _, A, _, _, _],
            [_, _, _, A, _, _, _],
            [_, _, _, A, _, _, N],
            [_, _, _, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_3_3');

        componentTestUtils.expectElementToHaveClasses('#case_3_2', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#case_3_3', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#case_3_4', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#case_3_5', ['base', 'captured']);
    }));
    it('should make pieces disappear upon selection of a capture', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, N],
            [_, _, B, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 2))).toBeFalse();
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 3))).toBeFalse();
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 4))).toBeFalse();
        expect(componentTestUtils.getComponent().isPiece(new Coord(3, 5))).toBeFalse();
    }));
    it('should accept placing after performing initial captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, N],
            [_, _, B, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);
        await componentTestUtils.expectMoveSuccess('#click_0_4', move, undefined, [0, 0]);
    }));
    it('should not allow capturing from a coord that is part of intersecting captures', fakeAsync(async() => {
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
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickFailure('#click_2_3', GipfFailure.AMBIGUOUS_CAPTURE_COORD());
    }));
    it('should not allow clicking on anything else than a capture if there is one in the final captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, _, _, _],
            [N, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, N],
            [A, _, B, _, _, N, N],
            [_, _, B, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P1Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        // Perform the placement to prepare for final capture
        await componentTestUtils.expectClickSuccess('#click_0_3');
        await componentTestUtils.expectClickSuccess('#click_1_3');
        await componentTestUtils.expectClickFailure('#click_3_3', GipfFailure.MISSING_CAPTURES());
    }));
    it('should perform move after final captures has been done', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, _, _, _],
            [N, _, _, A, _, A, _],
            [B, B, A, _, _, _, _],
            [_, A, B, _, _, _, N],
            [A, _, B, _, _, N, N],
            [_, _, B, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P1Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_0_3');
        await componentTestUtils.expectClickSuccess('#click_1_3');

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 3), MGPOptional.of(HexaDirection.RIGHT)),
                                            [],
                                            [new GipfCapture([
                                                new Coord(2, 3), new Coord(2, 4), new Coord(2, 5), new Coord(2, 6),
                                            ])]);

        await componentTestUtils.expectMoveSuccess('#click_2_3', move, undefined, [0, 0]);
    }));
    it('should highlight moved pieces only', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, _, _, A, _],
            [_, _, _, _, B, _, _],
            [_, _, _, A, _, _, N],
            [_, _, _, _, _, N, N],
            [_, B, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        const placement: GipfPlacement = new GipfPlacement(new Coord(1, 6), MGPOptional.of(HexaDirection.UP_RIGHT));
        const move: GipfMove = new GipfMove(placement, [], []);
        await componentTestUtils.expectClickSuccess('#click_1_6');
        await componentTestUtils.expectMoveSuccess('#click_2_5', move, undefined, [0, 0]);

        expect(componentTestUtils.getComponent().getCaseClass(new Coord(1, 6))).toEqual('moved');
        expect(componentTestUtils.getComponent().getCaseClass(new Coord(2, 5))).toEqual('moved');
        expect(componentTestUtils.getComponent().getCaseClass(new Coord(3, 4))).not.toEqual('moved');
    }));
    it('should highlight capturable pieces', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, N],
            [_, _, B, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        expect(componentTestUtils.getComponent().possibleCaptures).toContain(new GipfCapture([
            new Coord(3, 2),
            new Coord(3, 3),
            new Coord(3, 4),
            new Coord(3, 5),
        ]));
    }));
    it('should highlight captured pieces positions', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, N],
            [_, _, B, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);

        await componentTestUtils.expectMoveSuccess('#click_0_4', move, undefined, [0, 0]);

        componentTestUtils.expectElementToHaveClasses('#case_3_2', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#case_3_3', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#case_3_4', ['base', 'captured']);
        componentTestUtils.expectElementToHaveClasses('#case_3_5', ['base', 'captured']);
    }));
    it('should update the number of pieces available', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, _],
            [N, _, _, A, _, A, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, B, B, N],
            [_, _, B, A, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(0, 4), MGPOptional.empty()),
                                            [new GipfCapture([
                                                new Coord(3, 2), new Coord(3, 3), new Coord(3, 4), new Coord(3, 5),
                                            ])], []);

        await componentTestUtils.expectMoveSuccess('#click_0_4', move, undefined, [0, 0]);

        expect(componentTestUtils.getComponent().getPlayerSidePieces(0).length).toBe(8);
        expect(componentTestUtils.getComponent().getPlayerSidePieces(1).length).toBe(5);
    }));
    it('should not accept placement on a complete line', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, A, _, B],
            [N, _, _, _, _, A, _],
            [_, _, _, _, B, _, _],
            [_, _, _, A, _, _, N],
            [_, _, B, _, _, N, N],
            [_, B, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_1_6');
        expect(componentTestUtils.getComponent().arrows.length).toBe(1);
        await componentTestUtils.expectClickFailure('#click_2_5', GipfFailure.PLACEMENT_ON_COMPLETE_LINE());
    }));
    it('should accept moves with two initial captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, A, _, A, _, _],
            [N, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, A, _, A, _, N],
            [_, _, _, _, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

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
        await componentTestUtils.expectMoveSuccess('#click_6_3', move, undefined, [0, 0]);
    }));
    it('should accept moves with two final captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, A, _, A, _, _],
            [N, _, A, _, A, _, _],
            [_, _, A, _, A, _, _],
            [_, _, _, A, B, A, N],
            [_, _, _, _, _, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        const move: GipfMove = new GipfMove(new GipfPlacement(new Coord(5, 4),
                                                              MGPOptional.of(HexaDirection.LEFT)),
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
        await componentTestUtils.expectMoveSuccess('#click_2_4', move, undefined, [0, 0]); // select second capture
    }));
    it('should remove highlights and arrows upon move cancellation', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, _],
            [N, N, _, _, _, _, _],
            [N, _, _, A, _, _, _],
            [_, _, _, A, A, _, _],
            [_, _, _, A, A, _, N],
            [_, _, _, A, A, N, N],
            [_, _, _, _, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);

        await componentTestUtils.expectClickSuccess('#click_3_3');
        await componentTestUtils.expectClickSuccess('#click_4_5');
        await componentTestUtils.expectClickSuccess('#click_4_4');
        await componentTestUtils.expectClickFailure('#click_3_3', GipfFailure.MISSING_CAPTURES());

        componentTestUtils.expectElementToHaveClasses('#case_4_5', ['base']);
        componentTestUtils.expectElementToHaveClasses('#case_3_3', ['base']);
        expect(componentTestUtils.getComponent().arrows.length).toBe(0);
    }));
    it('should recompute captures upon intersecting captures', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, A, _, _, A],
            [N, N, _, A, _, _, A],
            [N, A, A, _, A, B, A],
            [_, _, _, A, _, _, A],
            [_, _, _, A, _, _, N],
            [A, A, A, B, B, N, N],
            [_, _, _, A, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [8, 4], [2, 3]);
        componentTestUtils.setupState(state);

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
        await componentTestUtils.expectMoveSuccess('#click_3_0', move, undefined, [0, 0]); // Final capture 2
    }));
    it('should not allow selecting placement when no direction is valid', fakeAsync(async() => {
        const board: Table<FourStatePiece> = [
            [N, N, N, _, _, _, B],
            [N, N, _, _, _, A, _],
            [N, _, _, _, B, _, _],
            [A, _, _, A, _, _, _],
            [B, _, B, _, _, _, N],
            [A, A, _, _, _, N, N],
            [B, A, B, A, N, N, N],
        ];
        const state: GipfState = new GipfState(board, P0Turn, [5, 5], [0, 0]);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickFailure('#click_0_6', GipfFailure.NO_DIRECTIONS_AVAILABLE());
    }));
});
