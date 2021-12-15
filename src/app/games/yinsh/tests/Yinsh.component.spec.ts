import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { YinshComponent } from '../yinsh.component';
import { YinshFailure } from '../YinshFailure';
import { YinshState } from '../YinshState';
import { YinshCapture, YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { Table } from 'src/app/utils/ArrayUtils';

describe('YinshComponent', () => {

    let testUtils: ComponentTestUtils<YinshComponent>;
    const _: YinshPiece = YinshPiece.EMPTY;
    const N: YinshPiece = YinshPiece.NONE;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const B: YinshPiece = YinshPiece.RING_ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<YinshComponent>('Yinsh');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    describe('Initial placement phase', () => {
        it('should allow placing a ring and show it highlighted', fakeAsync(async() => {
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);
            await testUtils.expectMoveSuccess('#click_3_2', move, undefined, [0, 0]);
            testUtils.expectElementToHaveClasses('#case_3_2', ['base', 'moved']);
        }));
        it('should forbid placing a ring on an occupied space', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [4, 5], 1);
            testUtils.setupState(state);
            await testUtils.expectClickFailure('#click_3_2', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }));
        it('should decrease the number of rings shown on the side when a ring is placed', fakeAsync(async() => {
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);
            testUtils.expectElementToExist('#player_0_sideRing_5');
            await testUtils.expectMoveSuccess('#click_3_2', move, undefined, [0, 0]);
            testUtils.expectElementNotToExist('#player_0_sideRing_5');
        }));
    });
    describe('Main phase', () => {
        it('should allow a simple move without capture', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 3)),
                                                  []);
            await testUtils.expectClickSuccess('#click_3_2');
            await testUtils.expectMoveSuccess('#click_3_3', move, undefined, [0, 0]);
        }));
        it('should show flipped markers as moved', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, a, b, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(6, 2)),
                                                  []);
            await testUtils.expectClickSuccess('#click_3_2');
            await testUtils.expectMoveSuccess('#click_6_2', move, undefined, [0, 0]);

            testUtils.expectElementToHaveClass('#case_3_2', 'moved'); // the new marker
            testUtils.expectElementToHaveClass('#case_4_2', 'moved'); // a flipped marker
            testUtils.expectElementToHaveClass('#case_5_2', 'moved'); // another flipped marker
            testUtils.expectElementToHaveClass('#case_6_2', 'moved'); // the moved ring
        }));
        it('should fill the ring selected at the beginning of a move', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);
            testUtils.expectElementNotToExist('#marker_3_2');
            await testUtils.expectClickSuccess('#click_3_2');
            testUtils.expectElementToHaveClass('#marker_3_2', 'player0');
            testUtils.expectElementToHaveClass('#ring_3_2', 'player0-stroke');
        }));
        it('should enable selecting capture by first clicking the capture group, then the ring taken', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(3, 2))],
                                                  new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                                                  []);

            await testUtils.expectClickSuccess('#click_3_3'); // click the captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the ring
            await testUtils.expectClickSuccess('#click_4_2'); // select the other ring
            await testUtils.expectMoveSuccess('#click_4_3', move, undefined, [0, 0]); // move it
        }));
        it('should highlight possible captures', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            testUtils.expectElementToExist('#selectable_3_3');
            testUtils.expectElementToHaveClass('#selectable_3_3', 'capturable');
            testUtils.expectElementToHaveClass('#selectable_3_4', 'capturable');
            testUtils.expectElementToHaveClass('#selectable_3_5', 'capturable');
            testUtils.expectElementToHaveClass('#selectable_3_6', 'capturable');
        }));
        it('should show selected captures, and remove highlight upon cancellation', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            testUtils.expectElementNotToExist('#selected_3_3');
            testUtils.expectElementNotToExist('#selected_3_4');
            testUtils.expectElementNotToExist('#selected_3_5');
            testUtils.expectElementNotToExist('#selected_3_6');

            await testUtils.expectClickSuccess('#click_3_3'); // click the first captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the first ring

            testUtils.expectElementToHaveClass('#selected_3_3', 'selected');
            testUtils.expectElementToHaveClass('#selected_3_4', 'selected');
            testUtils.expectElementToHaveClass('#selected_3_5', 'selected');
            testUtils.expectElementToHaveClass('#selected_3_6', 'selected');

            // Click on something else than a ring to cancel move
            await testUtils.expectClickFailure('#click_5_5', YinshFailure.SHOULD_SELECT_PLAYER_RING());

            testUtils.expectElementNotToExist('#selected_3_3');
            testUtils.expectElementNotToExist('#selected_3_4');
            testUtils.expectElementNotToExist('#selected_3_5');
            testUtils.expectElementNotToExist('#selected_3_6');

        }));
        it('should support multiple captures', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, A, _, _, _, _, _],
                [N, N, _, a, a, _, _, _, _, _, _],
                [N, _, _, a, a, _, _, _, _, _, _],
                [N, _, _, a, a, _, _, _, _, _, N],
                [_, _, _, a, a, _, _, _, _, _, N],
                [_, _, _, a, a, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove = new YinshMove([
                YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(3, 2)),
                YinshCapture.of(new Coord(4, 3), new Coord(4, 7), new Coord(4, 2))],
                                                  new Coord(5, 2), MGPOptional.of(new Coord(4, 2)),
                                                  []);

            await testUtils.expectClickSuccess('#click_3_3'); // click the first captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the first ring
            await testUtils.expectClickSuccess('#click_4_3'); // click the second captured group
            await testUtils.expectClickSuccess('#click_4_2'); // click the second ring
            await testUtils.expectClickSuccess('#click_5_2'); // select the remaining ring
            await testUtils.expectMoveSuccess('#click_4_2', move, undefined, [0, 0]); // move it
        }));
        it('should fail when trying to move while there are still captures', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            await testUtils.expectClickFailure('#click_4_2', YinshFailure.MISSING_CAPTURES());
        }));
        it('should show the number of rings of each player', fakeAsync(async() => {
            const state: YinshState = new YinshState(YinshState.getInitialState().board, [2, 1], 10);
            testUtils.setupState(state);

            testUtils.expectElementToExist('#player_0_sideRing_1');
            testUtils.expectElementToExist('#player_0_sideRing_2');
            testUtils.expectElementNotToExist('#player_0_sideRing_3');
            testUtils.expectElementNotToExist('#player_0_sideRing_4');
            testUtils.expectElementNotToExist('#player_0_sideRing_5');
            testUtils.expectElementToExist('#player_1_sideRing_1');
            testUtils.expectElementNotToExist('#player_1_sideRing_2');
            testUtils.expectElementNotToExist('#player_1_sideRing_3');
            testUtils.expectElementNotToExist('#player_1_sideRing_4');
            testUtils.expectElementNotToExist('#player_1_sideRing_5');
        }));
        it('should increase the number of rings shown when a player makes a capture', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);
            testUtils.expectElementNotToExist('#player_0_sideRing_1');

            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(3, 2))],
                                                  new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                                                  []);

            await testUtils.expectClickSuccess('#click_3_3'); // click the captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the ring
            await testUtils.expectClickSuccess('#click_4_2'); // select the other ring
            await testUtils.expectMoveSuccess('#click_4_3', move, undefined, [0, 0]); // move it

            testUtils.expectElementToExist('#player_0_sideRing_1');
        }));
        it('should recompute captures upon intersecting captures', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, a, a, a, a, a, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            for (const coord of [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5]]) {
                testUtils.expectElementToExist('#selectable_' + coord[0] + '_' + coord[1]);
            }

            await testUtils.expectClickSuccess('#click_3_3'); // capture
            await testUtils.expectClickSuccess('#click_3_2'); // select the ring

            // There now should only remain 5 selectable coords
            for (const coord of [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7]]) {
                testUtils.expectElementNotToExist('#selectable_' + coord[0] + '_' + coord[1]);
            }
            for (const coord of [[4, 5], [5, 5], [6, 5], [7, 5], [8, 5]]) {
                testUtils.expectElementToExist('#selectable_' + coord[0] + '_' + coord[1]);
            }
        }));
        it('should highlight the rings instead of the captures after selecting a capture', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, a, a, a, a, a, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            testUtils.expectElementNotToExist('#ring_0');
            testUtils.expectElementToExist('#selectable_3_3');

            await testUtils.expectClickSuccess('#click_3_3'); // capture

            testUtils.expectElementNotToExist('#selectable_3_3');
            testUtils.expectElementToExist('#selectable_3_2'); // ring
            testUtils.expectElementToExist('#selectable_4_2'); // other ring
        }));
        it('should forbid clicking on two ambiguous capture coordinates', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, a, a, a, a, a, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            await testUtils.expectClickSuccess('#click_4_5');
            await testUtils.expectClickFailure('#click_5_5', YinshFailure.AMBIGUOUS_CAPTURE_COORD());
        }));
        it('should cancel the move when clicking on something else than a ring after a capture', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];

            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            await testUtils.expectClickSuccess('#click_3_3');
            await testUtils.expectClickFailure('#click_3_5', YinshFailure.CAPTURE_SHOULD_TAKE_RING());
        }));
        it('should cancel the move when clicking on an invalid move destination', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, _, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            await testUtils.expectClickSuccess('#click_3_2');
            await testUtils.expectClickFailure('#click_3_3', YinshFailure.SHOULD_END_MOVE_ON_EMPTY_SPACE());
        }));
        it('should allow moves with one final capture', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, A, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 3), MGPOptional.of(new Coord(3, 7)),
                                                  [YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(4, 2))]);

            await testUtils.expectClickSuccess('#click_3_3'); // Select the ring
            await testUtils.expectClickSuccess('#click_3_7'); // Move it
            await testUtils.expectClickSuccess('#click_3_6'); // Select the capture
            await testUtils.expectMoveSuccess('#click_4_2', move, undefined, [0, 0]); // Take a ring
        }));
        it('should allow moves with two final captures', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, A, A, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, a, a, a, a, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove =
                new YinshMove([],
                              new Coord(3, 3), MGPOptional.of(new Coord(3, 8)),
                              [
                                  YinshCapture.of(new Coord(3, 2), new Coord(3, 6), new Coord(4, 2)),
                                  YinshCapture.of(new Coord(3, 7), new Coord(7, 7), new Coord(5, 2)),
                              ]);

            await testUtils.expectClickSuccess('#click_3_3'); // Select the ring
            await testUtils.expectClickSuccess('#click_3_8'); // Move it
            await testUtils.expectClickSuccess('#click_3_2'); // Select first capture
            await testUtils.expectClickSuccess('#click_4_2'); // Take a ring
            await testUtils.expectClickSuccess('#click_3_7'); // Select second capture
            await testUtils.expectMoveSuccess('#click_5_2', move, undefined, [0, 0]); // Take another ring
        }));
        it('should allow moves with two final captures, when selecting ambiguous coord first', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, a, A, A, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, _],
                [N, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, _, _, _, _, _, _, N],
                [_, _, _, b, a, a, a, a, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove =
                new YinshMove([],
                              new Coord(3, 3), MGPOptional.of(new Coord(3, 8)),
                              [
                                  YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(4, 2)),
                              ]);

            await testUtils.expectClickSuccess('#click_3_3'); // Select the ring
            await testUtils.expectClickSuccess('#click_3_8'); // Move it
            await testUtils.expectClickSuccess('#click_3_7'); // Select first capture, first coord
            await testUtils.expectClickSuccess('#click_3_3'); // select first capture, second coord
            await testUtils.expectMoveSuccess('#click_4_2', move, undefined, [0, 0]); // Take a ring
        }));
        it('should allow selecting ambiguous captures with two clicks', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, A, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, _, a, _, _, _, _, _],
                [N, _, _, _, a, a, _, _, _, _, N],
                [_, _, _, a, _, a, _, _, _, _, N],
                [_, _, a, _, _, a, _, _, _, N, N],
                [_, a, _, _, _, a, _, _, N, N, N],
                [_, _, _, _, _, a, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove =
                new YinshMove([
                    YinshCapture.of(new Coord(5, 4), new Coord(5, 8), new Coord(3, 2)),
                ],
                              new Coord(4, 1), MGPOptional.of(new Coord(4, 2)),
                              []);

            await testUtils.expectClickSuccess('#click_5_4'); // select first capture coord
            await testUtils.expectClickSuccess('#click_5_5'); // select second capture coord
            await testUtils.expectClickSuccess('#click_3_2'); // select the first ring taken
            await testUtils.expectClickSuccess('#click_4_1'); // select ring to move
            await testUtils.expectMoveSuccess('#click_4_2', move, undefined, [0, 0]); // move the ring
        }));
        it('should cancel move when second ambiguous capture click is invalid', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, A, _, _, _, _, _, _],
                [N, N, N, A, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, _, a, _, _, _, _, _],
                [N, _, _, _, a, a, _, _, _, _, N],
                [_, _, _, a, _, a, _, _, _, _, N],
                [_, _, a, _, _, a, _, _, _, N, N],
                [_, a, _, _, _, a, _, _, N, N, N],
                [_, _, _, _, _, a, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            await testUtils.expectClickSuccess('#click_5_4'); // select first capture coord
            await testUtils.expectClickFailure('#click_6_8', YinshFailure.MISSING_CAPTURES()); // select second capture coord
        }));
        it('should make pieces captured at the last turn disappear upon first player action', fakeAsync(async() => {
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, B, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, _, N],
                [_, _, _, a, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, [0, 0], 10);
            testUtils.setupState(state);

            const move: YinshMove =
                new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(3, 2))],
                              new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                              []);

            await testUtils.expectClickSuccess('#click_3_3'); // capture
            await testUtils.expectClickSuccess('#click_3_2'); // take ring
            await testUtils.expectClickSuccess('#click_4_2'); // move start
            await testUtils.expectMoveSuccess('#click_4_3', move, undefined, [0, 0]); // move end

            testUtils.expectElementToExist('#marker_3_3');
            testUtils.expectElementToHaveClass('#pieceGroup_3_3', 'transparent');
            testUtils.expectElementToExist('#ring_3_2');
            testUtils.expectElementToHaveClass('#pieceGroup_3_2', 'transparent');

            await testUtils.expectClickSuccess('#click_5_2'); // move start, other player

            testUtils.expectElementNotToExist('#marker_3_3');
            testUtils.expectElementNotToHaveClass('#pieceGroup_3_3', 'transparent');
            testUtils.expectElementNotToExist('#ring_3_2');
            testUtils.expectElementNotToHaveClass('#pieceGroup_3_2', 'transparent');

        }));
    });
});

