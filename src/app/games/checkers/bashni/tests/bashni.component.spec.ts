/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '../../../../jscaip/Coord';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { CheckersFailure } from '../../common/CheckersFailure';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState, OddCheckersState } from '../../common/CheckersState';
import { CheckersComponentTestEntries, DoCheckersTests } from '../../common/tests/CheckersTest.spec';
import { BashniRules } from '../BashniRules';
import { BashniComponent } from '../bashni.component';

const zero: CheckersPiece = CheckersPiece.ZERO;
const zeroPromoted: CheckersPiece = CheckersPiece.ZERO_PROMOTED;
const one: CheckersPiece = CheckersPiece.ONE;

const _O: CheckersStack = new CheckersStack([zeroPromoted]);
const _U: CheckersStack = new CheckersStack([zero]);
const _V: CheckersStack = new CheckersStack([one]);
const __: CheckersStack = CheckersStack.EMPTY;

const bashniEntries: CheckersComponentTestEntries<BashniComponent, BashniRules> = {
    gameName: 'Bashni',
    component: BashniComponent,
    firstPlayerCoords: [
        new Coord(0, 5),
        new Coord(2, 5),
        new Coord(4, 5),
        new Coord(6, 5),
    ],
    firstPlayerSecondClicks: [new Coord(1, 4)],
    secondMove: CheckersMove.fromStep(new Coord(1, 2), new Coord(0, 3)),
    promotedPieceTest: {
        state: OddCheckersState.of([
            [__, __, __, __, __, __, __, __],
            [__, __, _O, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [_V, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 10),
        coord: new Coord(2, 1),
        landings: [
            new Coord(1, 0),
            new Coord(3, 0),
            new Coord(3, 2),
            new Coord(1, 2),
        ],
    },
    forcedCaptureTest: {
        state: OddCheckersState.of([
            [__, __, __, __, __, __, __, __],
            [_V, __, __, __, __, __, __, __],
            [__, _U, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 1),
        coord: new Coord(0, 1),
    },
    unmovableTest: {
        coord: new Coord(1, 6),
    },
    invalidVerticalMoveTest: {
        state: OddCheckersState.of([
            [__, _U, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [_V, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 0),
        coord: new Coord(1, 1),
    },
    simpleCaptureTest: {
        state: OddCheckersState.of([
            [__, _U, __, __, __, __, __, __],
            [_V, __, _V, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(1, 0), new Coord(3, 2)]),
    },
    promotionTest: {
        state: OddCheckersState.of([
            [__, __, __, __, __, __, _V, __],
            [__, __, _U, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 0),
        move: CheckersMove.fromStep(new Coord(2, 1), new Coord(1, 0)),
    },
    complexCaptureTest: {
        state: OddCheckersState.of([
            [__, __, __, __, __, __, __, __],
            [__, __, _V, __, __, __, __, __],
            [__, _U, __, _U, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, _U, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 1), new Coord(4, 3), new Coord(6, 5)]),
    },
    invalidCaptureTest: {
        state: OddCheckersState.of([
            [__, __, __, __, __, __, __, __],
            [__, __, _V, __, __, __, __, __],
            [__, _V, __, _U, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, _U, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 1), new Coord(0, 3)]),
    },
    invalidThirdMoveTest: {
        start: new Coord(1, 4),
        end: new Coord(3, 5),
    },
};

DoCheckersTests(bashniEntries);

describe('BashniComponent', () => {

    let testUtils: ComponentTestUtils<BashniComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<BashniComponent>('Bashni');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    it('should allow mid-capture promotion', fakeAsync(async() => {
        // Given a state where we can do a mid-capture promotion
        const state: CheckersState = OddCheckersState.of([
            [__, __, __, __, __, __, __, __],
            [__, __, _V, __, _V, __, __, __],
            [__, __, __, __, __, _U, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 0);
        await testUtils.setupState(state);

        // When doing it and using the king's ability to jump
        const move: CheckersMove = CheckersMove.fromCapture([
            new Coord(5, 2),
            new Coord(3, 0),
            new Coord(0, 3),
        ]);
        await testUtils.expectClickSuccess('#coord-5-2');
        await testUtils.expectClickSuccess('#coord-3-0');

        // Then it should be a success
        await testUtils.expectMoveSuccess('#coord-0-3', move);
    }));

    it('should allow choosing shorter capture in the component', fakeAsync(async() => {
        // Given a board where a king can choose a shorter or longer capture
        const state: CheckersState = OddCheckersState.of([
            [__, __, __, __, __, _O, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, _V, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, _V, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 0);
        await testUtils.setupState(state);

        // When choosing the shorter capture: landing at (1, 4)
        const move: CheckersMove = CheckersMove.fromCapture([
            new Coord(5, 0),
            new Coord(1, 4),
        ]);
        await testUtils.expectClickSuccess('#coord-5-0');

        // Then it should be a success (it should NOT force continuation)
        await testUtils.expectMoveSuccess('#coord-1-4', move);
    }));

    it('should forbid skipping capture after selecting a piece that must capture', fakeAsync(async() => {
        // Given a board with a possible capture
        const state: CheckersState = OddCheckersState.of([
            [__, _V, __, _V, __, _V, __, _V],
            [_V, __, _V, __, _V, __, _V, __],
            [__, _V, __, _V, __, _V, __, _V],
            [__, __, _U, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, _U, __, _U, __, _U, __],
            [__, _U, __, _U, __, _U, __, _U],
            [_U, __, _U, __, _U, __, _U, __],
        ], 1);
        await testUtils.setupState(state);

        // When selecting the capturer and clicking a legal non-capturing step
        await testUtils.expectClickSuccess('#coord-1-2');

        // Then it should report the rule-level failure instead of crashing
        await testUtils.expectClickFailure('#coord-0-3', CheckersFailure.CANNOT_SKIP_CAPTURE());
    }));

});
