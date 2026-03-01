/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../../jscaip/Coord';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { CheckersConfig } from '../../common/AbstractCheckersRules';
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
        new Coord(1, 6),
        new Coord(3, 6),
        new Coord(5, 6),
        new Coord(7, 6),
    ],
    firstPlayerSecondClicks: [new Coord(0, 5), new Coord(2, 5)],
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
        [_V, __, _V, __, _V, __, _V, __],
        [__, _V, __, _V, __, _V, __, _V],
        [_V, __, _V, __, _V, __, _V, __],
        [__, _U, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [_U, __, __, __, _U, __, _U, __],
        [__, _U, __, _U, __, _U, __, _U],
        [_U, __, _U, __, _U, __, _U, __],
    ], 1),
    forcedToMove: new Coord(1, 2),
    unmovable: new Coord(1, 6),
    secondMove: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get(),
    stateWithInvalidVerticalMove: CheckersState.of([
        [_V, __, _V, __, _V, __, _V, __],
        [__, _V, __, _V, __, _V, __, _V],
        [_V, __, _V, __, _V, __, _V, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, _U, __, _U, __, _U, __, _U],
        [_U, __, _U, __, _U, __, _U, __],
        [__, _U, __, _U, __, _U, __, _U],
    ], 1),
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
    simpleCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get(),
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
    stateWithComplexeCapture: CheckersState.of([
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, _V, __, __, __, __, __],
        [__, _U, __, _U, __, __, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, _U, __, __],
        [__, __, __, __, __, __, __, __],
        [__, __, __, __, __, __, __, __],
    ], 1),
    complexeCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get(),
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
    invalidCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get(),
    invalidThirdMove: [new Coord(2, 4), new Coord(4, 3)],
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

});
