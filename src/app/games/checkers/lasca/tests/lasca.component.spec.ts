/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { Coord } from '@everyboard/games';
import { DirectionFailure } from '@everyboard/games';
import { PlayerMap, PlayerNumberMap } from '@everyboard/games';
import { CheckersConfig } from '@everyboard/games';
import { CheckersMove } from '@everyboard/games';
import { CheckersPiece, CheckersStack, CheckersState, EvenCheckersState } from '@everyboard/games';
import { LascaRules } from '@everyboard/games';
import { CheckersFailure } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { CheckersComponentTestEntries, DoCheckersTests } from '../../common/tests/CheckersTest.spec';
import { LascaComponent } from '../lasca.component';

const zero: CheckersPiece = CheckersPiece.ZERO;
const zeroPromoted: CheckersPiece = CheckersPiece.ZERO_PROMOTED;
const one: CheckersPiece = CheckersPiece.ONE;

const _O: CheckersStack = new CheckersStack([zeroPromoted]);
const _U: CheckersStack = new CheckersStack([zero]);
const _V: CheckersStack = new CheckersStack([one]);
const UV: CheckersStack = new CheckersStack([zero, one]);
const __: CheckersStack = CheckersStack.EMPTY;

const lascaEntries: CheckersComponentTestEntries<LascaComponent, LascaRules> = {
    gameName: 'Lasca',
    component: LascaComponent,
    firstPlayerCoords: [
        new Coord(0, 4),
        new Coord(2, 4),
        new Coord(4, 4),
        new Coord(6, 4),
    ],
    firstPlayerSecondClicks: [new Coord(1, 3)],
    secondMove: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]),
    promotedPieceTest: {
        state: EvenCheckersState.of([
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, _O, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
        ], 10),
        coord: new Coord(2, 2),
        landings: [
            new Coord(1, 1),
            new Coord(3, 1),
            new Coord(3, 3),
            new Coord(1, 3),
        ],
    },
    forcedCaptureTest: {
        state: EvenCheckersState.of([
            [_V, __, _V, __, _V, __, _V],
            [__, _V, __, _V, __, _V, __],
            [_V, __, _V, __, _V, __, _V],
            [__, _U, __, __, __, __, __],
            [_U, __, __, __, _U, __, _U],
            [__, _U, __, _U, __, _U, __],
            [_U, __, _U, __, _U, __, _U],
        ], 1),
        coord: new Coord(0, 2),
    },
    unmovableTest: {
        coord: new Coord(0, 6),
    },
    invalidVerticalMoveTest: {
        state: EvenCheckersState.of([
            [_V, __, _V, __, _V, __, _V],
            [__, _V, __, _V, __, _V, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, _U, __, _U, __, _U, __],
            [_U, __, _U, __, _U, __, _U],
        ], 1),
        coord: new Coord(1, 1),
    },
    simpleCaptureTest: {
        state: EvenCheckersState.of([
            [_V, __, _V, __, _V, __, _V],
            [__, _V, __, _V, __, _V, __],
            [_V, __, _V, __, _V, __, _V],
            [__, UV, __, __, __, __, __],
            [__, __, _U, __, _U, __, _U],
            [__, __, __, _U, __, _U, __],
            [_U, __, __, __, _U, __, _U],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]),
    },
    promotionTest: {
        state: EvenCheckersState.of([
            [__, __, __, __, _V, __, _V],
            [__, _U, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [_U, __, _U, __, _U, __, _U],
        ], 0),
        move: CheckersMove.fromStep(new Coord(1, 1), new Coord(0, 0)),
    },
    complexCaptureTest: {
        state: EvenCheckersState.of([
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, _V, __, __, __, __],
            [__, _U, __, _U, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, _U, __],
            [__, __, __, __, __, __, __],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)]),
    },
    returnToStartCaptureTest: {
        state: EvenCheckersState.of([
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, _V, __, _V, __],
            [__, __, __, __, __, __, _O],
            [__, __, __, _V, __, _V, __],
            [__, __, __, __, __, __, __],
        ], 0),
        move: CheckersMove.fromCapture([
            new Coord(6, 4),
            new Coord(4, 2),
            new Coord(2, 4),
            new Coord(4, 6),
            new Coord(6, 4),
        ]),
    },
    invalidCaptureTest: {
        state: EvenCheckersState.of([
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, _V, __, __, __, __],
            [__, _V, __, _U, __, __, __],
            [__, __, __, __, __, __, __],
            [__, __, __, __, __, _U, __],
            [__, __, __, __, __, __, __],
        ], 1),
        move: CheckersMove.fromCapture([new Coord(2, 2), new Coord(0, 4)]),
    },
    invalidThirdMoveTest: {
        start: new Coord(2, 4),
        end: new Coord(4, 3),
    },
};


describe('LascaComponent', () => {

    const defaultConfig: CheckersConfig = LascaRules.get().getDefaultRulesConfig();

    let testUtils: ComponentTestUtils<LascaComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LascaComponent>('Lasca');
    }));

    describe('generic tests', () => {
        DoCheckersTests(() => testUtils, lascaEntries);
    });

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('second click', () => {

        it('should forbid long step for normal piece (2 step)', fakeAsync(async() => {
            // Given any board where the selected piece could do a long jump
            const state: CheckersState = EvenCheckersState.of([
                [_V, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, _U],
            ], 0);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-6-6');

            // When trying doing a two step jump with a normal piece
            // Then it should fail
            const reason: string = CheckersFailure.NO_PIECE_CAN_DO_LONG_JUMP();
            await testUtils.expectClickFailure('#coord-4-4', reason);
        }));

    });

    describe('multiple capture', () => {

        it('should perform capture when no more piece can be captured', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: CheckersState = EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _V, __, __, __, __],
                [__, _U, __, _U, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _U, __],
                [__, __, __, __, __, __, __],
            ], 3);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-2');
            await testUtils.expectClickSuccess('#coord-4-4');

            // When doing the last capture
            const captures: Coord[] = [new Coord(2, 2), new Coord(4, 4), new Coord(6, 6)];
            const move: CheckersMove = CheckersMove.fromCapture(captures);

            // Then the move should be finalized
            await testUtils.expectMoveSuccess('#coord-6-6', move);
            // Then a stack of three piece should exist
            testUtils.expectElementToExist('#square-6-6-piece-0');
            testUtils.expectElementToExist('#square-6-6-piece-1');
            testUtils.expectElementToExist('#square-6-6-piece-2');
        }));

        it('should cancel move when trying non-ordinal move mid-capture', fakeAsync(async() => {
            // Given a board on which a piece is selected and already captured
            const state: CheckersState = EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _V, __, __, __, __],
                [__, _U, __, _U, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, _U, __],
                [__, __, __, __, __, __, __],
            ], 1);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#coord-2-2');
            await testUtils.expectClickSuccess('#coord-4-4');

            // When doing the last click that make an illegal step
            const reason: string = DirectionFailure.DIRECTION_MUST_BE_LINEAR();
            await testUtils.expectClickFailure('#coord-6-5', reason);

            // Then the move should be cancelled and stack should be back in place
            testUtils.expectElementNotToExist('#square-4-4-piece-0');
        }));

    });

    describe('interactivity', () => {

        it('should show possible selections when interactive', fakeAsync(async() => {
            // Given a state
            // When it is interactive
            testUtils.getGameComponent().setInteractive(true);
            // Then it should show possible selections
            testUtils.expectElementToHaveClass('#clickable-highlight-0-4', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-2-4', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-4-4', 'clickable-stroke');
            testUtils.expectElementToHaveClass('#clickable-highlight-6-4', 'clickable-stroke');
        }));

        it('should not show possible selections for opponent', fakeAsync(async() => {
            // Given a state
            const state: CheckersState = LascaRules.get().getInitialState(defaultConfig);

            // When it is not interactive
            testUtils.getGameComponent().setInteractive(false);
            await testUtils.setupState(state);

            // Then it should not show possible selections
            testUtils.expectElementNotToExist('.clickable-stroke');
        }));

    });

    describe('design', () => {

        it('should show score as the number of remaining piece', fakeAsync(async() => {
            // Given a board where there is a different number of remaining piece
            const state: CheckersState = EvenCheckersState.of([
                [_V, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, _V, __, __, __, _V],
                [__, __, __, _U, __, _U, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 0);

            // When rendering state
            await testUtils.setupState(state);

            // Then the score should be displayed
            const score: PlayerNumberMap = PlayerNumberMap.of(2, 3);
            const scoreOptional: MGPOptional<PlayerMap<number>> = MGPOptional.of(score);
            expect(testUtils.getGameComponent().scores).toEqual(scoreOptional);
        }));

    });

    describe('Custom configs', () => {
        it('should fail when doing invalid frisian capture', fakeAsync(async() => {
            // Given any board with a selected piece that could do a frisian capture
            const customConfig: CheckersConfig = {
                ...defaultConfig,
                frisianCaptureAllowed: true,
            };
            const state: CheckersState = EvenCheckersState.of([
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [_V, __, _U, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
                [__, __, __, __, __, __, __],
            ], 1);
            await testUtils.setupState(state, { config: customConfig });
            await testUtils.expectClickSuccess('#coord-0-2');

            // When clicking on an empty square in (+3; 0) of selected piece
            // Then it should fail
            const reason: string = CheckersFailure.FRISIAN_CAPTURE_MUST_BE_EVEN();
            await testUtils.expectClickFailure('#coord-3-2', reason);
        }));

    });

});
