/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { PlayerNumberMap } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { RulesFailure } from '../../../jscaip/RulesFailure';
import { Table } from '../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { YinshFailure } from '../YinshFailure';
import { YinshCapture, YinshMove } from '../YinshMove';
import { YinshPiece } from '../YinshPiece';
import { YinshRules } from '../YinshRules';
import { YinshState } from '../YinshState';
import { YinshComponent } from '../yinsh.component';

describe('YinshComponent', () => {

    let testUtils: ComponentTestUtils<YinshComponent>;
    const _: YinshPiece = YinshPiece.EMPTY;
    const N: YinshPiece = YinshPiece.UNREACHABLE;
    const a: YinshPiece = YinshPiece.MARKER_ZERO;
    const b: YinshPiece = YinshPiece.MARKER_ONE;
    const A: YinshPiece = YinshPiece.RING_ZERO;
    const B: YinshPiece = YinshPiece.RING_ONE;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<YinshComponent>('Yinsh');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('Initial placement phase', () => {

        it('should allow placing a ring and show it highlighted', fakeAsync(async() => {
            // Given a state in the initial placement phase
            // When clicking on an empty space
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);

            // Then it should place a ring and show it
            await testUtils.expectMoveSuccess('#click-3-2', move);
            testUtils.expectElementToHaveClasses('#space-3-2', ['base', 'moved-fill']);
        }));

        it('should forbid placing a ring on an occupied space', fakeAsync(async() => {
            // Given a state in placement phase with at least one occupied space
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(4, 5), 1);
            await testUtils.setupState(state);

            // When clicking on an occupied space
            // Then it should fail
            await testUtils.expectClickFailure('#click-3-2', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
        }));

        it('should decrease the number of rings shown on the side when a ring is placed', fakeAsync(async() => {
            // Given a state in placement phase, with all rings available
            testUtils.expectElementToExist('#PLAYER_ZERO-side-ring-5');
            // When When placing a ring
            const move: YinshMove = new YinshMove([], new Coord(3, 2), MGPOptional.empty(), []);
            await testUtils.expectMoveSuccess('#click-3-2', move);
            // Then it should not show the placed ring on the side anymore
            testUtils.expectElementNotToExist('#PLAYER_ZERO-side-ring-5');
        }));

    });

    describe('Main phase', () => {

        it(`should highlight clickable rings when it is the player's turn`, fakeAsync(async() => {
            // Given a board where it is player's turn
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, B, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            const component: YinshComponent = testUtils.getGameComponent();
            spyOn(component, 'isPlayerTurn').and.returnValue(true);

            // When rendering the board
            await testUtils.setupState(state);

            // Then the player's ring should be selectable
            testUtils.expectElementToExist('#selectable-3-3');
            testUtils.expectElementNotToExist('#selectable-4-4');
        }));

        it('should not highlight clickable rings when it is not players turn', fakeAsync(async() => {
            // Given a board where it is not player's turn
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, B, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            const component: YinshComponent = testUtils.getGameComponent();
            spyOn(component, 'isPlayerTurn').and.returnValue(false);

            // When rendering the board
            await testUtils.setupState(state);

            // Then the rings should not be selectable
            testUtils.expectElementNotToExist('#selectable-3-3');
            testUtils.expectElementNotToExist('#selectable-4-4');
        }));

        it('should display score as 0 - 0 when game is in placement phase', fakeAsync(async() => {
            // Given the initial state
            const state: YinshState = YinshRules.get().getInitialState();

            // When rendering the board
            await testUtils.setupState(state);

            // Then the score (0 - 0) should be displayed
            const expectedScore: MGPOptional<PlayerNumberMap> = MGPOptional.of(PlayerNumberMap.of(0, 0));
            expect(testUtils.getGameComponent().scores).toEqual(expectedScore);
        }));

        it('should display score ring count when game is second phase', fakeAsync(async() => {
            // Given a game in its main phases, with captures already done
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, _, _, _, _, _, _, _, _],
                [N, N, _, A, _, _, _, _, _, _, _],
                [N, _, _, _, B, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(2, 1), 20);

            // Then rendering it
            await testUtils.setupState(state);

            // Then score (2 - 1) should be displayed
            const expectedScore: MGPOptional<PlayerNumberMap> = MGPOptional.of(PlayerNumberMap.of(2, 1));
            expect(testUtils.getGameComponent().scores).toEqual(expectedScore);
        }));

        it('should allow a simple move without capture', fakeAsync(async() => {
            // Given a state
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            // When performing a simple move by clicking in the ring, then somewhere aligned
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(3, 3)),
                                                  []);
            // Then it should succeed
            await testUtils.expectClickSuccess('#click-3-2');
            await testUtils.expectMoveSuccess('#click-3-3', move);
        }));

        it('should show flipped markers as moved', fakeAsync(async() => {
            // Given a board with some markers
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            // When performing a move that flips the markers
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(6, 2)),
                                                  []);
            await testUtils.expectClickSuccess('#click-3-2');
            await testUtils.expectMoveSuccess('#click-6-2', move);

            // Then the markers and the ring should be shown as moved
            testUtils.expectElementToHaveClass('#space-3-2', 'moved-fill'); // the new marker
            testUtils.expectElementToHaveClass('#space-4-2', 'moved-fill'); // a flipped marker
            testUtils.expectElementToHaveClass('#space-5-2', 'moved-fill'); // another flipped marker
            testUtils.expectElementToHaveClass('#space-6-2', 'moved-fill'); // the moved ring
        }));

        it('should show passed-by spaces', fakeAsync(async() => {
            // Given a board with some markers
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            // When performing a move that flips the markers
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 2), MGPOptional.of(new Coord(6, 2)),
                                                  []);
            await testUtils.expectClickSuccess('#click-3-2');
            await testUtils.expectMoveSuccess('#click-6-2', move);

            // Then the markers and the ring should be shown as moved
            testUtils.expectElementToHaveClass('#space-3-2', 'moved-fill'); // the new marker
            testUtils.expectElementToHaveClass('#space-4-2', 'moved-fill'); // a flipped marker
            testUtils.expectElementToHaveClass('#space-5-2', 'moved-fill'); // another flipped marker
            testUtils.expectElementToHaveClass('#space-6-2', 'moved-fill'); // the moved ring
        }));

        it('should fill the ring selected at the beginning of a move', fakeAsync(async() => {
            // Given a board with a ring
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            testUtils.expectElementNotToExist('#marker-3-2');
            // When clicking on the ring
            await testUtils.expectClickSuccess('#click-3-2');
            // Then it should show a marker there now
            testUtils.expectElementToHaveClass('#marker-3-2', 'player0-fill');
            testUtils.expectElementToHaveClass('#ring-3-2 > circle:nth-child(2)', 'player0-stroke');
        }));

        it('should enable selecting capture by first clicking the capture group, then the ring taken', fakeAsync(async() => {
            // Given a board with an initial capture available
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When clicking on the capture and then doing the rest of the move
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3),
                                                                   new Coord(3, 7),
                                                                   MGPOptional.of(new Coord(3, 2)))],
                                                  new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                                                  []);
            // Then it should succeed
            await testUtils.expectClickSuccess('#click-3-3'); // click the captured group
            await testUtils.expectClickSuccess('#click-3-2'); // click the ring
            await testUtils.expectClickSuccess('#click-4-2'); // select the other ring
            await testUtils.expectMoveSuccess('#click-4-3', move); // move it
        }));

        it('should highlight possible captures', fakeAsync(async() => {
            // Given a board with possible captures
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);

            // When rendering the board
            await testUtils.setupState(state);

            // Then it should show the pieces as capturable
            testUtils.expectElementToExist('#selectable-3-3');
            testUtils.expectElementToHaveClass('#selectable-3-3', 'capturable-stroke');
            testUtils.expectElementToHaveClass('#selectable-3-4', 'capturable-stroke');
            testUtils.expectElementToHaveClass('#selectable-3-5', 'capturable-stroke');
            testUtils.expectElementToHaveClass('#selectable-3-6', 'capturable-stroke');
        }));

        it('should show selected captures, and remove highlight upon cancellation', fakeAsync(async() => {
            // Given a board with a possible capture
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            testUtils.expectElementNotToExist('#selected-3-3');
            testUtils.expectElementNotToExist('#selected-3-4');
            testUtils.expectElementNotToExist('#selected-3-5');
            testUtils.expectElementNotToExist('#selected-3-6');

            // When selecting a capture
            await testUtils.expectClickSuccess('#click-3-3'); // click the first captured group
            await testUtils.expectClickSuccess('#click-3-2'); // click the first ring

            // Then the capture should be selected
            testUtils.expectElementToHaveClass('#selected-3-3', 'selected-stroke');
            testUtils.expectElementToHaveClass('#selected-3-4', 'selected-stroke');
            testUtils.expectElementToHaveClass('#selected-3-5', 'selected-stroke');
            testUtils.expectElementToHaveClass('#selected-3-6', 'selected-stroke');

            // When clicking on something else than a ring to cancel move
            await testUtils.expectClickFailure('#click-5-5', YinshFailure.SHOULD_SELECT_PLAYER_RING());

            // Then the capture should not be selected anymore
            testUtils.expectElementNotToExist('#selected-3-3');
            testUtils.expectElementNotToExist('#selected-3-4');
            testUtils.expectElementNotToExist('#selected-3-5');
            testUtils.expectElementNotToExist('#selected-3-6');

        }));

        it('should support multiple captures', fakeAsync(async() => {
            // Given a board with a possible multi-capture
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When clicking on both captures and performing a move
            const move: YinshMove = new YinshMove([
                YinshCapture.of(new Coord(3, 3), new Coord(3, 7), MGPOptional.of(new Coord(3, 2))),
                YinshCapture.of(new Coord(4, 3), new Coord(4, 7), MGPOptional.of(new Coord(4, 2)))],
                                                  new Coord(5, 2), MGPOptional.of(new Coord(4, 2)),
                                                  []);

            // Then it should succeed
            await testUtils.expectClickSuccess('#click-3-3'); // click the first captured group
            await testUtils.expectClickSuccess('#click-3-2'); // click the first ring
            await testUtils.expectClickSuccess('#click-4-3'); // click the second captured group
            await testUtils.expectClickSuccess('#click-4-2'); // click the second ring
            await testUtils.expectClickSuccess('#click-5-2'); // select the remaining ring
            await testUtils.expectMoveSuccess('#click-4-2', move); // move it
        }));

        it('should fail when trying to move while there are still captures', fakeAsync(async() => {
            // Given a board with a capture
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When trying to place a marker in a ring
            // Then it should fail
            await testUtils.expectClickFailure('#click-4-2', YinshFailure.MISSING_CAPTURES());
        }));

        it('should show the number of rings of each player', fakeAsync(async() => {
            // Given the initial board
            const state: YinshState =
                new YinshState(YinshRules.get().getInitialState().board, PlayerNumberMap.of(2, 1), 10);

            // When rendering the board
            await testUtils.setupState(state);

            // Then it should show all side rings for each player
            testUtils.expectElementToExist('#PLAYER_ZERO-side-ring-1');
            testUtils.expectElementToExist('#PLAYER_ZERO-side-ring-2');
            testUtils.expectElementNotToExist('#PLAYER_ZERO-side-ring-3');
            testUtils.expectElementNotToExist('#PLAYER_ZERO-side-ring-4');
            testUtils.expectElementNotToExist('#PLAYER_ZERO-side-ring-5');
            testUtils.expectElementToExist('#PLAYER_ONE-side-ring-1');
            testUtils.expectElementNotToExist('#PLAYER_ONE-side-ring-2');
            testUtils.expectElementNotToExist('#PLAYER_ONE-side-ring-3');
            testUtils.expectElementNotToExist('#PLAYER_ONE-side-ring-4');
            testUtils.expectElementNotToExist('#PLAYER_ONE-side-ring-5');
        }));

        it('should increase the number of rings shown when a player makes a capture', fakeAsync(async() => {
            // Given a board with a possible capture, and no ring available for player 0
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            testUtils.expectElementNotToExist('#PLAYER_ZERO-side-ring-1');

            // When performing a move that captures
            const move: YinshMove = new YinshMove([YinshCapture.of(new Coord(3, 3),
                                                                   new Coord(3, 7),
                                                                   MGPOptional.of(new Coord(3, 2)))],
                                                  new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                                                  []);

            await testUtils.expectClickSuccess('#click-3-3'); // click the captured group
            await testUtils.expectClickSuccess('#click-3-2'); // click the ring
            await testUtils.expectClickSuccess('#click-4-2'); // select the other ring
            await testUtils.expectMoveSuccess('#click-4-3', move); // move it

            // Then the captured ring of player 0 is shown
            testUtils.expectElementToExist('#PLAYER_ZERO-side-ring-1');
        }));

        it('should recompute captures upon intersecting captures', fakeAsync(async() => {
            // Given a board with intersecting captures
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            for (const coord of [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5]]) {
                // All elements of the captures must be selectable
                testUtils.expectElementToExist('#selectable-' + coord[0] + '-' + coord[1]);
            }

            // When performing a capture and selecting a ring
            await testUtils.expectClickSuccess('#click-3-3'); // capture
            await testUtils.expectClickSuccess('#click-3-2'); // select the ring

            // Then there now should only remain 5 selectable coords
            for (const coord of [[3, 3], [3, 4], [3, 5], [3, 6], [3, 7]]) {
                testUtils.expectElementNotToExist('#selectable-' + coord[0] + '-' + coord[1]);
            }
            for (const coord of [[4, 5], [5, 5], [6, 5], [7, 5], [8, 5]]) {
                testUtils.expectElementToExist('#selectable-' + coord[0] + '-' + coord[1]);
            }
        }));

        it('should highlight the rings instead of the captures after selecting a capture', fakeAsync(async() => {
            // Given a board with a capture to select
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            testUtils.expectElementNotToExist('#ring-0');
            testUtils.expectElementToExist('#selectable-3-3');

            // When capturing
            await testUtils.expectClickSuccess('#click-3-3'); // capture

            // Then it should highlight the rings instead
            testUtils.expectElementNotToExist('#selectable-3-3');
            testUtils.expectElementToExist('#selectable-3-2'); // ring
            testUtils.expectElementToExist('#selectable-4-2'); // other ring
        }));

        it('should forbid clicking on two ambiguous capture coordinates', fakeAsync(async() => {
            // Given a board with intersecting possible captures
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When clicking on the intersecting coordinate
            await testUtils.expectClickSuccess('#click-4-5');

            // Then it should fail
            await testUtils.expectClickFailure('#click-5-5', YinshFailure.AMBIGUOUS_CAPTURE_COORD());
        }));

        it('should cancel the move when clicking on something else than a ring after a capture', fakeAsync(async() => {
            // Given a board with a capture that has been selected
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

            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-3-3');

            // When clicking somewhere else than on a ring
            // Then it should fail
            await testUtils.expectClickFailure('#click-3-5', YinshFailure.CAPTURE_SHOULD_TAKE_RING());
        }));

        it('should cancel the move when clicking on an invalid move destination', fakeAsync(async() => {
            // Given a board with rings
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When moving on an occupied space
            // Then it should fail
            await testUtils.expectClickSuccess('#click-3-2');
            await testUtils.expectClickFailure('#click-3-3', YinshFailure.SHOULD_END_MOVE_ON_EMPTY_SPACE());
        }));

        it('should allow moves with one final capture', fakeAsync(async() => {
            // Given a board with possibility of creating a capture
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When creating the capture and selecting it
            const move: YinshMove = new YinshMove([],
                                                  new Coord(3, 3), MGPOptional.of(new Coord(3, 7)),
                                                  [YinshCapture.of(new Coord(3, 2),
                                                                   new Coord(3, 6),
                                                                   MGPOptional.of(new Coord(4, 2)))]);

            // Then it should succeed
            await testUtils.expectClickSuccess('#click-3-3'); // Select the ring
            await testUtils.expectClickSuccess('#click-3-7'); // Move it
            await testUtils.expectClickSuccess('#click-3-6'); // Select the capture
            await testUtils.expectMoveSuccess('#click-4-2', move); // Take a ring
        }));

        it('should allow moves with two final captures', fakeAsync(async() => {
            // Given a board with possibility of creating two captures
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When creating the captures and selecting them
            const move: YinshMove =
                new YinshMove([],
                              new Coord(3, 3), MGPOptional.of(new Coord(3, 8)),
                              [
                                  YinshCapture.of(new Coord(3, 2), new Coord(3, 6), MGPOptional.of(new Coord(4, 2))),
                                  YinshCapture.of(new Coord(3, 7), new Coord(7, 7), MGPOptional.of(new Coord(5, 2))),
                              ]);

            // Then it should succeed
            await testUtils.expectClickSuccess('#click-3-3'); // Select the ring
            await testUtils.expectClickSuccess('#click-3-8'); // Move it
            await testUtils.expectClickSuccess('#click-3-2'); // Select first capture
            await testUtils.expectClickSuccess('#click-4-2'); // Take a ring
            await testUtils.expectClickSuccess('#click-3-7'); // Select second capture
            await testUtils.expectMoveSuccess('#click-5-2', move); // Take another ring
        }));

        it('should allow moves with two final captures, when selecting ambiguous coord first', fakeAsync(async() => {
            // Given a board with possibility of creating two captures
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When creating the captures, selecting the ambiguous coord first
            const move: YinshMove =
                new YinshMove([],
                              new Coord(3, 3), MGPOptional.of(new Coord(3, 8)),
                              [
                                  YinshCapture.of(new Coord(3, 3), new Coord(3, 7), MGPOptional.of(new Coord(4, 2))),
                              ]);

            // Then it should succeed
            await testUtils.expectClickSuccess('#click-3-3'); // Select the ring
            await testUtils.expectClickSuccess('#click-3-8'); // Move it
            await testUtils.expectClickSuccess('#click-3-7'); // Select first capture, first coord
            await testUtils.expectClickSuccess('#click-3-3'); // select first capture, second coord
            await testUtils.expectMoveSuccess('#click-4-2', move); // Take a ring
        }));

        it('should allow selecting ambiguous captures with two clicks', fakeAsync(async() => {
            // Given a board with an ambiguous capture
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When capturing in two clicks
            const move: YinshMove = new YinshMove(
                [
                    YinshCapture.of(new Coord(5, 4), new Coord(5, 8), MGPOptional.of(new Coord(3, 2))),
                ],
                new Coord(4, 1),
                MGPOptional.of(new Coord(4, 2)),
                [],
            );
            // Then it should succeed
            await testUtils.expectClickSuccess('#click-5-4'); // select first capture coord
            await testUtils.expectClickSuccess('#click-5-5'); // select second capture coord
            await testUtils.expectClickSuccess('#click-3-2'); // select the first ring taken
            await testUtils.expectClickSuccess('#click-4-1'); // select ring to move
            await testUtils.expectMoveSuccess('#click-4-2', move); // move the ring
        }));

        it('should cancel move when second ambiguous capture click is invalid', fakeAsync(async() => {
            // Given a board with an ambiguous capture
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When trying to capture with two clicks, but clicking incorrectly
            // Then it should fail
            await testUtils.expectClickSuccess('#click-5-4'); // select first capture coord
            await testUtils.expectClickFailure('#click-6-8', YinshFailure.MISSING_CAPTURES()); // select second capture coord
        }));

        it('should make pieces captured at the last turn disappear upon first player click', fakeAsync(async() => {
            // Given a board with a previous move that has made a capture for current player now possible
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
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            const move: YinshMove =
                new YinshMove([YinshCapture.of(new Coord(3, 3), new Coord(3, 7), MGPOptional.of(new Coord(3, 2)))],
                              new Coord(4, 2), MGPOptional.of(new Coord(4, 3)),
                              []);

            await testUtils.expectClickSuccess('#click-3-3'); // capture
            await testUtils.expectClickSuccess('#click-3-2'); // take ring
            await testUtils.expectClickSuccess('#click-4-2'); // move start
            await testUtils.expectMoveSuccess('#click-4-3', move); // move end

            testUtils.expectElementToExist('#marker-3-3');
            testUtils.expectElementToHaveClass('#piece-group-3-3', 'semi-transparent');
            testUtils.expectElementToExist('#ring-3-2');
            testUtils.expectElementToHaveClass('#piece-group-3-2', 'semi-transparent');

            // When the first click of the next move is donen
            await testUtils.expectClickSuccess('#click-5-2'); // move start, other player

            // Then all previously captured pieces should have disappeared
            testUtils.expectElementNotToExist('#marker-3-3');
            testUtils.expectElementNotToHaveClass('#piece-group-3-3', 'semi-transparent');
            testUtils.expectElementNotToExist('#ring-3-2');
            testUtils.expectElementNotToHaveClass('#piece-group-3-2', 'semi-transparent');
        }));

        it('should show indicator when selecting your ring', fakeAsync(async() => {
            // Given an initial board on which a ring are all put
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, B, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When clicking on the ring
            await testUtils.expectClickSuccess('#click-3-2');

            // Then there should be indicators
            testUtils.expectElementToExist('#indicator-4-1'); // The one in the up-right diagonal
            testUtils.expectElementToExist('#indicator-2-3'); // The two in the down-left diagonal
            testUtils.expectElementToExist('#indicator-1-4');
        }));

        it('should cancel move attempt chosen ring when clicking on it again', fakeAsync(async() => {
            // Given an initial board on which a ring has been clicked (hence, the indicators are displayed)
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, B, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, a, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-3-2');

            // When clicking again on the ring
            await testUtils.expectClickFailure('#click-3-2');

            // Then there should no longer be indicators
            testUtils.expectElementNotToExist('#indicator-4-1'); // The one in the up-right diagonal
            testUtils.expectElementNotToExist('#indicator-2-3'); // The two in the down-left diagonal
            testUtils.expectElementNotToExist('#indicator-1-4');
        }));

        it('should change selected ring when clicking on another ring', fakeAsync(async() => {
            // Given a board where all ring are down already and one is selected
            const board: Table<YinshPiece> = [
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, _, _, _, _, _, _, _],
                [N, N, N, A, A, B, _, _, _, _, _],
                [N, N, _, a, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, _],
                [N, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ];
            const state: YinshState = new YinshState(board, PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click-3-2');

            // When clicking on another ring of current player
            await testUtils.expectClickSuccess('#click-4-2');

            // Then that new one should be selected
            testUtils.expectElementToExist('#indicator-5-1'); // The two in the up-right diagonal
            testUtils.expectElementToExist('#indicator-6-0');
            testUtils.expectElementToExist('#indicator-4-3'); // Some of the one below
            testUtils.expectElementToExist('#indicator-4-4');
            testUtils.expectElementToExist('#indicator-4-5');
        }));

        it('should not put marker inside captured ring', fakeAsync(async() => {
            // Given a state where two pre-captures are possible
            const state: YinshState = new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, A, _, _, B, B, A, _],
                [N, N, N, A, _, _, b, B, _, A, _],
                [N, N, _, A, _, _, _, _, _, B, _],
                [N, _, _, _, _, a, _, _, B, _, _],
                [N, _, _, _, a, a, _, b, _, _, N],
                [_, _, _, a, _, a, _, _, _, _, N],
                [_, _, a, _, _, a, _, _, _, N, N],
                [_, a, _, _, _, a, _, _, N, N, N],
                [_, _, _, _, _, a, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 10);
            await testUtils.setupState(state);

            // When choosing first pre-capture and ring
            await testUtils.expectClickSuccess('#click-4-5');
            await testUtils.expectClickSuccess('#click-3-3');

            // Then marker below captured piece should not exist
            testUtils.expectElementNotToExist('#marker-3-3');
            // But it should be selected
            testUtils.expectElementToExist('#selected-3-3');
            testUtils.expectElementToHaveClass('#ring-3-3 > circle:nth-child(2)', 'semi-transparent');
        }));

        it('should show multiple capture of previous turn', fakeAsync(async() => {
            // Given a state where two pre-capture must but shown
            const previousState: YinshState = new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, A, _, _, B, B, A, _],
                [N, N, N, A, _, _, b, B, _, A, _],
                [N, N, _, A, _, _, _, _, _, B, _],
                [N, _, _, _, _, a, _, _, B, _, _],
                [N, _, _, _, a, a, _, b, _, _, N],
                [_, _, _, a, _, a, _, _, _, _, N],
                [_, _, a, _, _, a, _, _, _, N, N],
                [_, a, _, _, _, a, _, _, N, N, N],
                [_, _, _, _, _, a, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 10);
            const initialCaptures: YinshCapture[] = [
                YinshCapture.of(new Coord(1, 8), new Coord(5, 4), MGPOptional.of(new Coord(3, 2))),
                YinshCapture.of(new Coord(5, 5), new Coord(5, 9), MGPOptional.of(new Coord(9, 1))),
            ];
            const previousMove: YinshMove = new YinshMove(initialCaptures,
                                                          new Coord(3, 3),
                                                          MGPOptional.of(new Coord(4, 3)),
                                                          [],
            );
            const state: YinshState = new YinshState([
                [N, N, N, N, N, N, _, _, _, _, N],
                [N, N, N, N, A, _, _, B, B, A, _],
                [N, N, N, _, _, _, b, B, _, A, _],
                [N, N, _, a, A, _, _, _, _, B, _],
                [N, _, _, _, _, _, _, _, B, _, _],
                [N, _, _, _, _, _, _, b, _, _, N],
                [_, _, _, _, _, _, _, _, _, _, N],
                [_, _, _, _, _, _, _, _, _, N, N],
                [_, _, _, _, _, _, _, _, N, N, N],
                [_, _, _, _, _, _, _, N, N, N, N],
                [N, _, _, _, _, N, N, N, N, N, N],
            ], PlayerNumberMap.of(0, 0), 11);

            // When rendering state
            await testUtils.setupState(state, { previousState, previousMove });

            // Then 10 different captures should be displayed and 2 rings taken
            for (const capture of previousMove.initialCaptures) {
                for (const capturedCoord of capture.capturedSpaces.concat(capture.ringTaken.get())) {
                    const spaceName: string = '#space-' + capturedCoord.x + '-' + capturedCoord.y;
                    testUtils.expectElementToHaveClass(spaceName, 'captured-fill');
                }
            }
        }));

    });

});
