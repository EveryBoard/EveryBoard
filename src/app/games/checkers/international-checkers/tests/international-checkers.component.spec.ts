/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../../jscaip/Coord';
import { DirectionFailure } from '../../../../jscaip/Direction';
import { PlayerMap, PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { CheckersConfig } from '../../common/AbstractCheckersRules';
import { CheckersFailure } from '../../common/CheckersFailure';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState, OddCheckersState } from '../../common/CheckersState';
import { CheckersComponentTestEntries, DoCheckersTests } from '../../common/tests/CheckersTest.spec';
import { InternationalCheckersRules } from '../InternationalCheckersRules';
import { InternationalCheckersComponent } from '../international-checkers.component';

const zero: CheckersPiece = CheckersPiece.ZERO;
const one: CheckersPiece = CheckersPiece.ONE;

const U: CheckersStack = new CheckersStack([zero]);
const O: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED]);
const V: CheckersStack = new CheckersStack([one]);
const _: CheckersStack = CheckersStack.EMPTY;

type InternationalCheckersComponentTestEntries = CheckersComponentTestEntries<InternationalCheckersComponent,
                                                                              InternationalCheckersRules>;

const internationalCheckersEntries: InternationalCheckersComponentTestEntries = {
    gameName: 'InternationalCheckers',
    component: InternationalCheckersComponent,
    firstPlayerCoords: [
        new Coord(1, 6),
        new Coord(3, 6),
        new Coord(5, 6),
        new Coord(7, 6),
        new Coord(9, 6),
    ],
    firstPlayerSecondClicks: [new Coord(0, 5), new Coord(2, 5)],
    secondMove: CheckersMove.fromStep(new Coord(0, 3), new Coord(1, 4)),
    promotedPieceTest: {
        state: OddCheckersState.of([
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [V, _, _, _, _, _, _, _, _, _],
        ], 10),
        coord: new Coord(5, 4),
        landings: [
            new Coord(1, 0),
            new Coord(2, 1),
            new Coord(3, 2),
            new Coord(4, 3),
            new Coord(6, 5),
            new Coord(7, 6),
            new Coord(8, 7),
            new Coord(9, 8),

            new Coord(9, 0),
            new Coord(8, 1),
            new Coord(7, 2),
            new Coord(6, 3),

            new Coord(4, 5),
            new Coord(3, 6),
            new Coord(2, 7),
            new Coord(1, 8),
        ],
    },
    forcedCaptureTest: {
        state: OddCheckersState.of([
            [_, _, _, _, _, _, _, _, _, _],
            [V, _, _, _, _, _, _, _, _, _],
            [_, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, V, _, V, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
        ], 1),
        coord: new Coord(0, 1),
    },
    unmovableTest: {
        coord: new Coord(0, 7),
    },
    invalidVerticalMoveTest: {
        state: OddCheckersState.of([
            [_, V, _, V, _, V, _, V, _, V],
            [V, _, V, _, V, _, V, _, V, _],
            [_, V, _, V, _, V, _, V, _, V],
            [V, _, V, _, V, _, V, _, V, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, U, _, U, _, U, _, U, _, U],
            [U, _, U, _, U, _, U, _, U, _],
            [_, U, _, U, _, U, _, U, _, U],
            [U, _, U, _, U, _, U, _, U, _],
        ], 1),
        coord: new Coord(0, 3),
    },
    simpleCaptureTest: {
        state: OddCheckersState.of([
            [_, V, _, V, _, V, _, V, _, V],
            [V, _, V, _, V, _, V, _, V, _],
            [_, V, _, V, _, V, _, V, _, V],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [V, _, _, _, _, _, _, _, _, _],
            [_, U, _, _, _, U, _, U, _, U],
            [_, _, _, _, _, _, _, _, _, _],
            [_, U, _, U, _, U, _, U, _, U],
            [U, _, U, _, U, _, U, _, U, _],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(0, 5), new Coord(2, 7)]),
    },
    promotionTest: {
        state: OddCheckersState.of([
            [_, _, _, _, _, V, _],
            [U, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 0),
        move: CheckersMove.fromStep(new Coord(0, 1), new Coord(1, 0)),
    },
    complexCaptureTest: {
        state: OddCheckersState.of([
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, V, _, _, _, _, _, _, _],
            [_, U, _, U, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, U, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 1), new Coord(4, 3), new Coord(6, 5)]),
    },
    returnToStartCaptureTest: {
        state: OddCheckersState.of([
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, V, _, V, _, _, _, _, _],
            [_, _, _, _, _, O, _, _, _, _],
            [_, _, V, _, V, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
        ], 0),
        move: CheckersMove.fromCapture([
            new Coord(5, 4),
            new Coord(3, 2),
            new Coord(1, 4),
            new Coord(3, 6),
            new Coord(5, 4),
        ]),
    },
    invalidCaptureTest: {
        state: OddCheckersState.of([
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, V, _, _, _, _, _, _, _],
            [_, V, _, U, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, U, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 1), new Coord(0, 3)]),
    },
    invalidThirdMoveTest: {
        start: new Coord(3, 6),
        end: new Coord(5, 5),
    },
};

fdescribe('InternationalCheckersComponent', () => {

    const defaultConfig: CheckersConfig = InternationalCheckersRules.get().getDefaultRulesConfig();

    let testUtils: ComponentTestUtils<InternationalCheckersComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<InternationalCheckersComponent>('InternationalCheckers');
    }));

    describe('generic tests', () => {
        DoCheckersTests(() => testUtils, internationalCheckersEntries);
    });

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('second click', () => {

        it('should forbid shorter capture when a longer one is available', fakeAsync(async() => {
            // Given a king that can capture one piece to the left or two pieces to the right
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, V, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, V, _, V, _, _, _, _],
                [_, _, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-4-5');

            // When attempting the valid but shorter capture to the left
            // Then it should fail
            await testUtils.expectClickFailure('#coord-2-3', CheckersFailure.MUST_DO_LONGEST_CAPTURE());
        }));

        it('should only highlight captured piece when doing flying capture with king', fakeAsync(async() => {
            // Given a board with a selected king and a possible capture
            const state: CheckersState = OddCheckersState.of([
                [_, O, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, V, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-1-0');

            // When doing a capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(1, 0), new Coord(5, 4)]);
            await testUtils.expectMoveSuccess('#coord-5-4', move);

            // Then only captured space should be captured-fill
            testUtils.expectElementToHaveClass('#square-4-3', 'captured-fill');
            testUtils.expectElementNotToHaveClass('#square-1-0', 'captured-fill');
            testUtils.expectElementNotToHaveClass('#square-2-1', 'captured-fill');
            testUtils.expectElementNotToHaveClass('#square-3-2', 'captured-fill');
            testUtils.expectElementNotToHaveClass('#square-5-4', 'captured-fill');
            // But they should be moved-fill (except the captured)
            testUtils.expectElementNotToHaveClass('#square-4-3', 'moved-fill');
            testUtils.expectElementToHaveClass('#square-1-0', 'moved-fill');
            testUtils.expectElementToHaveClass('#square-2-1', 'moved-fill');
            testUtils.expectElementToHaveClass('#square-3-2', 'moved-fill');
            testUtils.expectElementToHaveClass('#square-5-4', 'moved-fill');
        }));

        it('should allow doing flying capture with king with close-landing', fakeAsync(async() => {
            // Given a board with a selected king and a possible capture
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-4-5');

            // When doing a capture
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(4, 5), new Coord(0, 1)]);

            // Then it should be a success
            await testUtils.expectMoveSuccess('#coord-0-1', move);
        }));

        it('should allow doing flying multiple-capture with king with far-landing', fakeAsync(async() => {
            // Given a board with a selected king and a possible multiple-capture
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, V, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, V, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-6-7');
            await testUtils.expectClickSuccess('#coord-2-3');

            // When doing a capture
            const captures: Coord[] = [new Coord(6, 7), new Coord(2, 3), new Coord(0, 1)];
            const move: CheckersMove = CheckersMove.fromCapture(captures);

            // Then it should be a success
            await testUtils.expectMoveSuccess('#coord-0-1', move);
        }));

        it('should allow long step forward for king', fakeAsync(async() => {
            // Given any board with a king selected
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [V, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, O],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-9-8');

            // When doing the second click
            // Then it should succeed
            const move: CheckersMove = CheckersMove.fromStep(new Coord(9, 8), new Coord(5, 4));
            await testUtils.expectMoveSuccess('#coord-5-4', move);
        }));

    });

    describe('design', () => {

        it('should not show minority capture options', fakeAsync(async() => {
            // Given a board with a illegal minority option
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, V, _, _, _, V, _, _],
                [_, _, _, _, U, _, U, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);

            // When displaying the board
            await testUtils.setupState(state);

            // Then the majoritary capturer should be highlighted and the minortary capturer should not
            testUtils.expectElementToHaveClass('#clickable-highlight-4-5', 'clickable-stroke');
            testUtils.expectElementNotToExist('#clickable-highlight-6-5');
        }));

        it('should show score as the number of remaining piece', fakeAsync(async() => {
            // Given a board where there is a different number of remaining piece
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, V, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, V, _, _, _, V, _, _],
                [_, _, _, _, U, _, U, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 0);

            // When rendering state
            await testUtils.setupState(state);

            // Then the score should be displayed
            const score: PlayerNumberMap = PlayerNumberMap.of(2, 3);
            const scoreOptional: MGPOptional<PlayerMap<number>> = MGPOptional.of(score);
            expect(testUtils.getGameComponent().scores).toEqual(scoreOptional);
        }));

    });

    describe('multiple capture', () => {

        it('should perform capture when no more piece can be captured', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, V, _, _, _, _, _, _, _],
                [_, U, _, U, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, U, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-1');
            await testUtils.expectClickSuccess('#coord-4-3');

            // When doing the last capture
            const captures: Coord[] = [new Coord(2, 1), new Coord(4, 3), new Coord(6, 5)];
            const move: CheckersMove = CheckersMove.fromCapture(captures);

            // Then the move should be finalized
            await testUtils.expectMoveSuccess('#coord-6-5', move);
            // Then the stack of captured pieces should not exist
            testUtils.expectElementToExist('#square-6-5-piece-0');
            testUtils.expectElementNotToExist('#square-6-5-piece-1');
        }));

        it('should cancel move when trying non-ordinal move mid-capture', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, V, _, _, _, _, _, _, _],
                [_, U, _, U, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, U, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-1');
            await testUtils.expectClickSuccess('#coord-4-3');

            // When doing the last click that make an illegal step
            const reason: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
            await testUtils.expectClickFailure('#coord-6-4', reason);

            // Then the move should be cancelled and stack should be back in place
            testUtils.expectElementNotToExist('#square-4-3-piece-0');
        }));

    });

    describe('interactivity', () => {

        it('should show possible selections when interactive', fakeAsync(async() => {
            // Given a state
            // When it is interactive
            testUtils.getGameComponent().setInteractive(true);
            // Then it should show possible selections
            testUtils.expectElementToHaveClass('#clickable-highlight-1-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-3-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-5-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-7-6', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-9-6', 'clickable-stroke');
        }));

        it('should not show possible selections for opponent', fakeAsync(async() => {
            // Given a state
            const state: CheckersState = InternationalCheckersRules.get().getInitialState(defaultConfig);

            // When it is not interactive
            testUtils.getGameComponent().setInteractive(false);
            await testUtils.setupState(state);

            // Then it should not show possible selections
            testUtils.expectElementNotToExist('.clickable-stroke');
        }));

    });

    describe('custom config', () => {

        it('Should allow forward frisian-capture when config allows it', fakeAsync(async() => {
            // Given a board where a frisian capture is possible
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
            };
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, U, _, V, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, U, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
            ], 2);
            await testUtils.setupState(state, { config: customConfig });
            await testUtils.expectClickSuccess('#coord-3-4');

            // When doing the move
            // Then it should succeed
            const move: CheckersMove = CheckersMove.fromCapture([new Coord(3, 4), new Coord(3, 0)]);
            await testUtils.expectMoveSuccess('#coord-3-0', move);
        }));

    });

});
