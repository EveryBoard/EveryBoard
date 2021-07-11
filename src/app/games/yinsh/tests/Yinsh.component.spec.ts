import { fakeAsync, tick } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { YinshComponent } from '../Yinsh.component';
import { YinshBoard } from '../YinshBoard';
import { YinshFailure } from '../YinshFailure';
import { YinshGameState } from '../YinshGameState';
import { YinshCapture, YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';

fdescribe('YinshComponent', () => {
    let testUtils: ComponentTestUtils<YinshComponent>;
    const _: YinshPiece = YinshPiece.EMPTY;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
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
            await testUtils.expectMoveSuccess('#click_3_2', move);
            testUtils.expectElementToHaveClasses('#case_3_2', ['base', 'moved']);
        }));
        it('should forbid placing a ring on an occupied space', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [4, 5], 1);
            testUtils.setupSlice(state);
            await testUtils.expectClickFailure('#click_3_2', RulesFailure.MUST_CLICK_ON_EMPTY_CASE);
        }));
        it('should decrease the number of rings shown on the side when a ring is placed', fakeAsync(async() => {
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);
            testUtils.expectElementToExist('#player_0_sideRing_5');
            await testUtils.expectMoveSuccess('#click_3_2', move);
            testUtils.expectElementNotToExist('#player_0_sideRing_5');
        }));
    });
    describe('Main phase', () => {
        it('should allow a simple move without capture', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 3)),
                                                  []);
            await testUtils.expectClickSuccess('#click_3_2');
            await testUtils.expectMoveSuccess('#click_3_3', move);
        }));
        it('should fill the ring selected at the beginning of a move', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);
            testUtils.expectElementNotToHaveClass('#piece_3_2', 'player0');
            await testUtils.expectClickSuccess('#click_3_2');
            testUtils.expectElementToHaveClass('#piece_3_2', 'player0');
            testUtils.expectElementToHaveClass('#piece_3_2', 'player0-stroke');
        }));
        it('should enable selecting capture by first clicking the capture group, then the ring taken', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);

            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(3, 2))],
                                                  new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                                                  []);

            await testUtils.expectClickSuccess('#click_3_3'); // click the captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the ring
            await testUtils.expectClickSuccess('#click_4_2'); // select the other ring
            await testUtils.expectMoveSuccess('#click_4_3', move); // move it
        }));
        it('should highlight possible captures', fakeAsync(async() => {
            testUtils.expectElementNotToExist('#capture_0');
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);

            testUtils.expectElementToExist('#capture_0');
            testUtils.expectElementToHaveClass('#capture_0', 'capturable');
            testUtils.expectElementNotToExist('#capture_1');
        }));
        it('should make captured pieces disappear and show their background in red, and remove highlight upon cancellation', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);

            testUtils.expectElementNotToHaveClass('#case_3_3', 'captured');
            testUtils.expectElementNotToHaveClass('#case_3_4', 'captured');
            testUtils.expectElementNotToHaveClass('#case_3_5', 'captured');
            testUtils.expectElementNotToHaveClass('#case_3_6', 'captured');

            await testUtils.expectClickSuccess('#click_3_3'); // click the first captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the first ring

            testUtils.expectElementToHaveClass('#case_3_3', 'captured');
            testUtils.expectElementToHaveClass('#case_3_4', 'captured');
            testUtils.expectElementToHaveClass('#case_3_5', 'captured');
            testUtils.expectElementToHaveClass('#case_3_6', 'captured');

            await testUtils.expectClickFailure('#click_5_5', YinshFailure.SHOULD_SELECT_PLAYER_RING);

            testUtils.expectElementNotToHaveClass('#case_3_3', 'captured');
            testUtils.expectElementNotToHaveClass('#case_3_4', 'captured');
            testUtils.expectElementNotToHaveClass('#case_3_5', 'captured');
            testUtils.expectElementNotToHaveClass('#case_3_6', 'captured');

        }));
        it('should support multiple captures', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, A, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, a, a, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);

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
            await testUtils.expectMoveSuccess('#click_4_2', move); // move it
        }));
        it('should fail when trying to move while there are still captures', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);

            await testUtils.expectClickFailure('#click_4_2', YinshFailure.MISSING_CAPTURES);
        }));
        it('should show the number of rings of each player', fakeAsync(async() => {
            const state: YinshGameState = new YinshGameState(YinshBoard.EMPTY, [2, 1], 10);
            testUtils.setupSlice(state);

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
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);
            testUtils.expectElementNotToExist('#player_0_sideRing_1');

            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), new Coord(3, 2))],
                                                  new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                                                  []);

            await testUtils.expectClickSuccess('#click_3_3'); // click the captured group
            await testUtils.expectClickSuccess('#click_3_2'); // click the ring
            await testUtils.expectClickSuccess('#click_4_2'); // select the other ring
            await testUtils.expectMoveSuccess('#click_4_3', move); // move it

            testUtils.expectElementToExist('#player_0_sideRing_1');
        }));
        it('should recompute captures upon intersecting captures', fakeAsync(async() => {
            const board: YinshBoard = YinshBoard.of([
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, A, A, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, a, a, a, a, a, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, a, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _, _],
            ]);
            const state: YinshGameState = new YinshGameState(board, [0, 0], 10);
            testUtils.setupSlice(state);

            testUtils.expectElementToExist('#capture_0');
            testUtils.expectElementToExist('#capture_1');
            testUtils.expectElementToExist('#capture_2');
            testUtils.expectElementNotToExist('#capture_3');

            await testUtils.expectClickSuccess('#click_3_3');

            testUtils.expectElementToExist('#capture_0');
            testUtils.expectElementNotToExist('#capture_1');
            testUtils.expectElementNotToExist('#capture_2');
        }));
    });
});

