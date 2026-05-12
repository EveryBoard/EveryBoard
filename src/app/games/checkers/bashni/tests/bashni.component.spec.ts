/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '../../../../jscaip/Coord';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../../common/CheckersState';
import { CheckersComponentTestEntries, DoCheckersTests } from '../../common/tests/CheckersTest.spec';
import { BashniRules } from '../BashniRules';
import { BashniComponent } from '../bashni.component';

const zero: CheckersPiece = CheckersPiece.ZERO;
const zeroPromoted: CheckersPiece = CheckersPiece.ZERO_PROMOTED;
const one: CheckersPiece = CheckersPiece.ONE;

const _O: CheckersStack = new CheckersStack([zeroPromoted]);
const _U: CheckersStack = new CheckersStack([zero]);
const _V: CheckersStack = new CheckersStack([one]);
const UV: CheckersStack = new CheckersStack([zero, one]);
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
    promotedPieceOrientedState: CheckersState.of([
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, _O, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
    ], 10),
    promotedPieceCoord: new Coord(2, 2),
    promotedLandings: [
        new Coord(1, 1),
        new Coord(3, 1),
        new Coord(3, 3),
        new Coord(1, 3),
    ],
    stateWithForcedCapture: CheckersState.of([
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [_V, __, __, __, __, __, __, __],
        [__, _U, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
    ], 1),
    forcedToMove: new Coord(0, 2),
    unmovable: new Coord(1, 6),
    secondMove: CheckersMove.fromStep(new Coord(1, 2), new Coord(0, 3)),
    stateWithInvalidVerticalMove: CheckersState.of([
        [__, __, __, __, __, __, __, __],
        [__, _U, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
    ], 0),
    invalidStepperCoord: new Coord(1, 1),
    stateWithSimpleCapture: CheckersState.of([
        [_V, __, _V, __, _V, __, _V, __],
        [__, _V, __, _V, __, _V, __, _V],
        [_V, __, _V, __, _V, __, _V, __],
        [__, UV, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, _U, __, _U, __, _U, __],
        [_U, __, __, _U, __, _U, __, _U],
        [__, _U, __, _U, __, _U, __, _U],
    ], 1),
    simpleCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]),
    stateWithPromotion: CheckersState.of([
        [__, __, __, __, __, __, _V, __],
        [__, _U, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [_U, __, _U, __, _U, __, _U, __],
        [__, _U, __, _U, __, _U, __, _U],
    ], 0),
    promotion: CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0)),
    stateWithComplexCapture: CheckersState.of([
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, _V, __, __, __, __, __],
        [__, _U, __, _U, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, _U, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
    ], 1),
    complexCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]),
    stateWithInvalidCapture: CheckersState.of([
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, _V, __, __, __, __, __],
        [__, _V, __, _U, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, _U, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
    ], 1),
    invalidCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]),
    invalidThirdMove: [new Coord(1, 4), new Coord(3, 5)],
};

DoCheckersTests(bashniEntries);

fdescribe('BashniComponent', () => {

    let testUtils: ComponentTestUtils<BashniComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<BashniComponent>('Bashni');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    it('should allow mid-capture promotion', fakeAsync(async() => {
        // Given a state where we can do a mid-capture promotion
        const state: CheckersState = CheckersState.of([
            [__, __, __, __, __, __, __, __],
            [__, __, __, _V, __, _V, __, __],
            [__, __, __, __, __, __, _U, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __],
        ], 0);
        await testUtils.setupState(state);

        // When doing it and using the king's ability to jump
        const move: CheckersMove = CheckersMove.fromCapture([
            new Coord(6, 2),
            new Coord(4, 0),
            new Coord(1, 3),
        ]);
        await testUtils.expectClickSuccess('#coord-6-2');
        await testUtils.expectClickSuccess('#coord-4-0');

        // Then it should be a success
        await testUtils.expectMoveSuccess('#coord-1-3', move);
    }));

    it('should allow choosing shorter capture in the component', fakeAsync(async() => {
        // Given a board where a king can choose a shorter or longer capture
        const state: CheckersState = CheckersState.of([
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

});
