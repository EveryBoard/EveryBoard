/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { BashniComponent } from '../bashni.component';
import { CheckersMove } from '../../common/CheckersMove';
import { CheckersPiece, CheckersStack, CheckersState } from '../../common/CheckersState';
import { BashniRules } from '../BashniRules';
import { CheckersComponentTestEntries, DoCheckersTests } from '../../common/tests/CheckersTest.spec';

const zero: CheckersPiece = CheckersPiece.ZERO;
const one: CheckersPiece = CheckersPiece.ONE;

const U: CheckersStack = new CheckersStack([zero]);
const O: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED]);
const V: CheckersStack = new CheckersStack([one]);
const _: CheckersStack = CheckersStack.EMPTY;

type BashniComponentTestEntries = CheckersComponentTestEntries<BashniComponent, BashniRules>;

const bashniEntries: BashniComponentTestEntries = {
    gameName: 'Bashni',
    component: BashniComponent,
    firstPlayerCoords: [
        new Coord(0, 5),
        new Coord(2, 5),
        new Coord(4, 5),
        new Coord(6, 5),
    ],
    firstPlayerSecondClicks: [new Coord(1, 4), new Coord(3, 4)],
    promotedPieceOrientedState: CheckersState.of([
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, O, _, _, _],
        [_, _, _, _, _, _, _, _],
        [V, _, _, _, _, _, _, _],
    ], 10),
    promotedPieceCoord: new Coord(4, 5),
    promotedLandings: [
        new Coord(0, 1),
        new Coord(1, 2),
        new Coord(2, 3),
        new Coord(3, 4),
        new Coord(5, 6),
        new Coord(6, 7),

        new Coord(7, 2),
        new Coord(6, 3),
        new Coord(5, 4),

        new Coord(3, 6),
        new Coord(2, 7),
    ],
    stateWithForcedCapture: CheckersState.of([
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [V, _, _, _, _, _, _, _],
        [_, O, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, V, _, V, _, _, _, _],
    ], 1),
    forcedToMove: new Coord(0, 2),
    unmovable: new Coord(0, 7),
    secondMove: CheckersMove.fromStep(new Coord(0, 3), new Coord(1, 4)),
    stateWithInvalidVerticalMove: CheckersState.of([
        [_, V, _, V, _, V, _, V],
        [V, _, V, _, V, _, V, _],
        [_, V, _, V, _, V, _, V],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, U, _, U, _, U, _, U],
        [U, _, U, _, U, _, U, _],
    ], 1),
    invalidStepperCoord: new Coord(0, 3),
    stateWithSimpleCapture: CheckersState.of([
        [_, V, _, V, _, V, _, V],
        [V, _, V, _, V, _, V, _],
        [_, V, _, V, _, V, _, V],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [V, _, _, _, _, _, _, _],
        [_, U, _, _, _, U, _, U],
        [_, _, _, _, _, _, _, _],
    ], 1),
    simpleCapture: CheckersMove.fromCapture([new Coord(0, 5), new Coord(2, 7)]).get(),
    stateWithPromotion: CheckersState.of([
        [_, _, _, _, V, _, V, _],
        [_, U, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [U, _, U, _, U, _, U, _],
    ], 0),
    promotion: CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0)),
    stateWithComplexeCapture: CheckersState.of([
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, V, _, _, _, _, _],
        [_, U, _, U, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, U, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
    ], 1),
    complexeCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]).get(),
    stateWithInvalidCapture: CheckersState.of([
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, V, _, _, _, _, _],
        [_, V, _, U, _, _, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, U, _, _],
        [_, _, _, _, _, _, _, _],
        [_, _, _, _, _, _, _, _],
    ], 1),
    invalidCapture: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]).get(),
    invalidThirdMove: [new Coord(2, 5), new Coord(4, 4)],
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
