/* eslint-disable max-lines-per-function */
import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';
import { TutorialStep } from './TutorialStep';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { ComponentTestUtils, expectValidRouting } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialFailure } from './TutorialFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Router } from '@angular/router';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { OnlineGameCreationComponent } from '../../normal-component/online-game-creation/online-game-creation.component';
import { GameWrapperMessages } from '../GameWrapper';
import { NotFoundComponent } from '../../normal-component/not-found/not-found.component';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { Comparable } from 'src/app/utils/Comparable';
import { Player } from 'src/app/jscaip/Player';

describe('TutorialGameWrapperComponent for non-existing game', () => {
    it('should redirect to /notFound', fakeAsync(async() => {
        // Given a game wrapper for a game that does not exist
        const testUtils: ComponentTestUtils<AbstractGameComponent> = await ComponentTestUtils.basic('invalid-game', true);
        testUtils.prepareFixture(TutorialGameWrapperComponent);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo();

        // When loading the wrapper
        testUtils.detectChanges();
        tick(3000);

        // Then it goes to /notFound with the expected error message
        expectValidRouting(router, ['/notFound', GameWrapperMessages.NO_MATCHING_GAME('invalid-game')], NotFoundComponent, { skipLocationChange: true });
    }));
});

describe('TutorialGameWrapperComponent (wrapper)', () => {

    let testUtils: ComponentTestUtils<QuartoComponent, Comparable>;
    let wrapper: TutorialGameWrapperComponent;

    beforeEach(fakeAsync(async() => {
        testUtils =
            await ComponentTestUtils.forGameWithWrapper<QuartoComponent, Comparable>('Quarto', TutorialGameWrapperComponent);
        wrapper = testUtils.wrapper as TutorialGameWrapperComponent;
    }));
    describe('Common behavior', () => {
        // ///////////////////////// Before ///////////////////////////////////////
        it('should create', () => {
            expect(testUtils.wrapper).toBeTruthy();
            expect(testUtils.getComponent()).toBeTruthy();
        });
        it('should show informations below/beside the board', fakeAsync(async() => {
            // Given a certain TutorialStep
            const state: QuartoState = new QuartoState([
                [QuartoPiece.AAAA, QuartoPiece.AAAA, QuartoPiece.AAAA, QuartoPiece.AAAA],
                [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.AABB],
                [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.AABB],
                [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.AABB],
            ], 0, QuartoPiece.BBAA);
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'instruction',
                    state,
                    ['#click_0_0'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            // When starting tutorial
            wrapper.startTutorial(tutorial);

            // expect to see step instruction on component
            const expectedMessage: string = 'instruction';
            const currentMessage: string = testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const actualState: QuartoState = testUtils.getComponent().getState();
            expect(actualState).toEqual(state);
        }));
        it('should show previousMove when set', fakeAsync(async() => {
            // Given a certain TutorialStep with previousMove set and no previousState
            const tutorialPreviousMove: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            const tutorialState: QuartoState = new QuartoState([
                [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            ], 1, QuartoPiece.BBBB);
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'instruction',
                    tutorialState,
                    ['#click_0_0'],
                    'Congratulations!',
                    'Perdu.',
                ).withPreviousMove(tutorialPreviousMove),
            ];

            // When starting tutorial
            wrapper.startTutorial(tutorial);

            // expect to see setted previous move but no mother to the node
            const componentPreviousMove: QuartoMove = wrapper.gameComponent.node.move.get() as QuartoMove;
            expect(componentPreviousMove).toEqual(tutorialPreviousMove);
            expect(wrapper.gameComponent.node.mother.isAbsent()).toBeTrue();
        }));
        it('should show title of the steps, the selected one in bold', fakeAsync(async() => {
            // Given a TutorialStep with 3 steps
            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title 0',
                    'instruction',
                    QuartoState.getInitialState(),
                ),
                TutorialStep.informational(
                    'title 1',
                    'instruction',
                    QuartoState.getInitialState(),
                ),
                TutorialStep.informational(
                    'title 2',
                    'instruction',
                    QuartoState.getInitialState(),
                ),
            ];
            // When page rendered
            wrapper.startTutorial(tutorial);

            // expect to see three "li" with step title
            let expectedTitle: string = 'title 0';
            let currentTitle: string = testUtils.findElement('#step_0').nativeElement.innerHTML;
            expect(currentTitle).toBe(expectedTitle);
            expectedTitle = 'title 1';
            currentTitle = testUtils.findElement('#step_1').nativeElement.innerHTML;
            expect(currentTitle).toBe(expectedTitle);
        }));
        it('should call setRole according to the current player (player zero)', fakeAsync(async() => {
            // Given a tutorial a step for player zero
            const statePlayerZero: QuartoState = QuartoState.getInitialState();
            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    statePlayerZero,
                ),
            ];
            spyOn(wrapper, 'setRole').and.callThrough();

            // When rendering the page
            wrapper.startTutorial(tutorial);

            // Then it should call setRole with playerZero
            expect(wrapper.setRole).toHaveBeenCalledOnceWith(Player.ZERO);
        }));
        it('should call setRole according to the current player (player one)', fakeAsync(async() => {
            // Given a tutorial a step for player one
            const statePlayerOne: QuartoState = new QuartoState([
                [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            ], 1, QuartoPiece.BBBB);

            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    statePlayerOne,
                ),
            ];
            spyOn(wrapper, 'setRole').and.callThrough();

            // When rendering the page
            wrapper.startTutorial(tutorial);

            // Then it should call setRole with playerOne
            expect(wrapper.setRole).toHaveBeenCalledOnceWith(Player.ONE);
        }));
        // ///////////////////////// ATTEMPTING ///////////////////////////////////
        it('should go to specific step when clicking on it', fakeAsync(async() => {
            // Given a TutorialStep with 3 steps
            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
                TutorialStep.informational(
                    'title 1',
                    'instruction 1',
                    QuartoState.getInitialState(),
                ),
                TutorialStep.informational(
                    'title 2',
                    'instruction 2',
                    QuartoState.getInitialState(),
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When selecting a step
            const stepSelection: HTMLSelectElement = testUtils.findElement('#steps').nativeElement;
            stepSelection.value = stepSelection.options[2].value;
            stepSelection.dispatchEvent(new Event('change'));
            testUtils.detectChanges();

            // expect to have the step 2 shown
            const expectedMessage: string = 'instruction 2';
            const currentMessage: string = testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        // ///////////////////// Retry ///////////////////////////////////////////////////////////////////
        it('should start step again after clicking "retry" on step failure', fakeAsync(async() => {
            // Given any TutorialStep where an invalid move has been done
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.expectClickSuccess('#choosePiece_8');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAA);
            await testUtils.expectMoveSuccess('#chooseCoord_1_1', move);
            tick(10);

            // When clicking retry
            await testUtils.clickElement('#retryButton');

            // expect to see steps instruction message on component and board restarted
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('instruction');
            expect(testUtils.getComponent().getState())
                .toEqual(QuartoState.getInitialState());
        }));
        it('should start step again after clicking "retry" on step success', fakeAsync(async() => {
            // Given any TutorialStep
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            // When doing another move, then clicking retry
            await testUtils.expectClickSuccess('#choosePiece_15');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#chooseCoord_0_0', move);
            tick(10);
            await testUtils.clickElement('#retryButton');

            // expect to see steps instruction message on component and board restarted
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('instruction');
            expect(testUtils.getComponent().getState())
                .toEqual(QuartoState.getInitialState());
        }));
        it('should forbid clicking again on the board after success', fakeAsync(async() => {
            // Given a TutorialStep on which a valid move has been done.
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoState.getInitialState(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', move);
            tick(10);

            // When clicking again
            await testUtils.expectClickForbidden('#chooseCoord_2_2', TutorialFailure.STEP_FINISHED());
            tick(10);

            // expect to see still the steps success message on component
            const expectedMessage: string = 'Congratulations!';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should allow clicking again after restarting succeeded steps', fakeAsync(async() => {
            // Given any TutorialStep whose step has been succeeded and restarted
            wrapper.steps = [
                TutorialStep.forClick(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    ['#choosePiece_15'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            await testUtils.expectClickSuccess('#choosePiece_15');
            await testUtils.clickElement('#retryButton');

            // When trying again
            await testUtils.expectClickSuccess('#choosePiece_15');

            // expect to see success message again
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Congratulations!');
            expect(testUtils.getComponent().getState())
                .toEqual(QuartoState.getInitialState());
        }));
        // /////////////////////// Next /////////////////////////////////////////////////////////
        it('should allow to skip step', fakeAsync(async() => {
            // Given a TutorialStep with one click
            wrapper.steps = [
                TutorialStep.forClick(
                    'title',
                    'Explanation Explanation Explanation.',
                    QuartoState.getInitialState(),
                    ['chooseCoord_0_0'],
                    'Congratulations!',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title',
                    'Following Following Following.',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Fini.',
                    'Reperdu.',
                ),
            ];
            // When clicking "Skip"
            await testUtils.clickElement('#nextButton');

            // expect to see next step on component
            const expectedMessage: string = 'Following Following Following.';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            expect(wrapper.stepFinished[0]).toBeFalse();
        }));
        it('should move to the next unfinished step when next step is finished', fakeAsync(async() => {
            // Given a tutorial on which the two first steps have been skipped
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Congratulations!',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 1',
                    'instruction 1',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_1_1'],
                    'Congratulations!',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 2',
                    'instruction 2',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_2_2'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.clickElement('#nextButton');
            await testUtils.clickElement('#nextButton');
            await testUtils.expectClickSuccess('#chooseCoord_2_2');

            // When clicking next
            await testUtils.clickElement('#nextButton');

            // expect to be back at first step
            const expectedMessage: string = 'instruction 0';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should move to the first unfinished step when all next steps are finished', fakeAsync(async() => {
            // Given a tutorial on which the middle steps have been skipped
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Congratulations!',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 1',
                    'instruction 1',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_1_1'],
                    'Congratulations!',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 2',
                    'instruction 2',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_2_2'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.clickElement('#nextButton'); // Go to 1
            await testUtils.expectClickSuccess('#chooseCoord_1_1'); // Do 1
            await testUtils.clickElement('#nextButton'); // Go to 2
            await testUtils.clickElement('#nextButton'); // Go to 0

            // When clicking next
            await testUtils.clickElement('#nextButton'); // Should go to 2

            // expect to be back at first step
            const expectedMessage: string = 'instruction 2';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should show congratulation and play buttons at the end of the tutorial, hide next button', fakeAsync(async() => {
            // Given a TutorialStep whose last step has been done
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.expectClickSuccess('#chooseCoord_0_0');

            // When clicking next button
            await testUtils.clickElement('#nextButton');

            // expect to see end tutorial congratulations
            const expectedMessage: string = wrapper.COMPLETED_TUTORIAL_MESSAGE;
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(wrapper.successfulSteps).toBe(1);
            expect(currentMessage).toBe(expectedMessage);
            // expect next button to be hidden
            testUtils.expectElementNotToExist('#nextButton');
            // expect retry button to be hidden
            testUtils.expectElementNotToExist('#retryButton');
            // expect restart button to be here
            await testUtils.clickElement('#restartButton');
            expect(wrapper.successfulSteps).toBe(0);
        }));
        it('should allow to restart the whole tutorial when finished', fakeAsync(async() => {
            // Given a finished tutorial
            wrapper.startTutorial([
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ]);
            await testUtils.clickElement('#nextButton');

            // When clicking restart
            await testUtils.clickElement('#restartButton');

            // expect to be back on first step
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(wrapper.steps[0].instruction);
            expect(wrapper.stepFinished.every((v: boolean) => v === false)).toBeTrue();
            expect(wrapper.stepIndex).toEqual(0);
        }));
        it('should redirect to local game when asking for it when finished', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            // Given a finish tutorial
            wrapper.startTutorial([
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ]);
            testUtils.expectElementNotToExist('#playLocallyButton');
            await testUtils.clickElement('#nextButton');

            // When clicking play locally
            spyOn(router, 'navigate').and.callThrough();
            await testUtils.clickElement('#playLocallyButton');

            // expect navigator to have been called
            expectValidRouting(router, ['/local', 'Quarto'], LocalGameWrapperComponent);
        }));
        it('should redirect to online game when asking for it when finished and user is online', fakeAsync(async() => {
            // Given a finish tutorial
            wrapper.startTutorial([
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ]);
            testUtils.expectElementNotToExist('#playOnlineButton');
            await testUtils.clickElement('#nextButton');

            // When clicking play locally
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo();
            await testUtils.clickElement('#playOnlineButton');

            // expect navigator to have been called
            expectValidRouting(router, ['/play', 'Quarto'], OnlineGameCreationComponent);
        }));
    });
    describe('TutorialStep awaiting specific moves', () => {
        it('should show highlight of first click on multiclick game component', fakeAsync(async() => {
            // Given a TutorialStep with several moves
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoState.getInitialState(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing that move
            await testUtils.expectClickSuccess('#chooseCoord_3_3');
            tick(11);

            // expect highlight to be present
            testUtils.expectElementToExist('#selected');
        }));
        it('should show success message after step success', fakeAsync(async() => {
            // Given a TutorialStep with several moves
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoState.getInitialState(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing that move
            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', move);
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Congratulations!';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should show failure message after step failure', fakeAsync(async() => {
            // Given a TutorialStep with several move
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoState.getInitialState(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing another move
            await testUtils.expectClickSuccess('#chooseCoord_1_1');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', move);
            tick(10);

            // expect to see steps success message on component
            const expectedReason: string = 'Perdu.';
            const currentReason: string =
                testUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
        }));
        it('When illegal move is done, toast message should be shown and restart not needed', fakeAsync(async() => {
            // Given tutorial awaiting any move, but mocking rules to make it mark a move illegal
            const tutorial: TutorialStep[] = [
                TutorialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    new QuartoMove(0, 0, QuartoPiece.BABA),
                    'Congratulations!',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing a (virtually) illegal move
            const error: string = 'some error message...';
            spyOn(wrapper.gameComponent.rules, 'isLegal').and.returnValue(MGPFallible.failure(error));
            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveFailure('#choosePiece_15', error, move);
            tick(10);

            // expect to see message error
            const expectedReason: string = error;
            const currentReason: string =
                testUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
        }));
        it('When illegal click is tried, toast message should be shown and restart not needed', fakeAsync(async() => {
            // Given a TutorialStep on which illegal move has been tried
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title 0',
                    'instruction 0.',
                    new QuartoState([
                        [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                    ], 0, QuartoPiece.ABBA),
                    [new QuartoMove(3, 3, QuartoPiece.BBBB)],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.expectClickFailure('#chooseCoord_0_0', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
            tick(10);

            // expect to see cancelMove reason as message
            const expectedMessage: string = 'instruction 0.';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const currentReason: string =
                testUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
            // expect click to be still possible
            expect(testUtils.getComponent().canUserPlay('#chooseCoord_0_0').isSuccess()).toBeTrue();
            tick(10);
        }));
        it('should not show error if cancelMove is called with no specified reason', fakeAsync(async() => {
            // Given a tutorial awaiting a move
            const tutorial: TutorialStep[] = [
                TutorialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    new QuartoMove(0, 0, QuartoPiece.BABA),
                    'Congratulations!',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When cancelMove is called with no specified reason
            wrapper.gameComponent.cancelMove();

            // Then no error is shown
            testUtils.expectElementNotToExist('#currentReason');
        }));
        it('should propose to see the solution when move attempt done', fakeAsync(async() => {
            // Given a tutorial on which a non-awaited move has been done
            const awaitedMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BBAA);
            const stepInitialTurn: number = 0;
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title 0',
                    'instruction 0.',
                    new QuartoState([
                        [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                    ], stepInitialTurn, QuartoPiece.ABBA),
                    [awaitedMove],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.expectClickSuccess('#chooseCoord_1_1');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAA);
            await testUtils.expectMoveSuccess('#choosePiece_8', move);
            tick(10);
            expect(wrapper.moveAttemptMade).toBeTrue();
            expect(wrapper.stepFinished[wrapper.stepIndex])
                .toBeFalse();

            // When clicking "Show Solution"
            await testUtils.clickElement('#showSolutionButton');

            // Expect the first awaited move to have been done
            expect(testUtils.getComponent().node.move.get()).toEqual(awaitedMove);
            expect(testUtils.getComponent().getTurn()).toEqual(stepInitialTurn + 1);
            // expect 'solution' message to be shown
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Congratulations!');
            // expect step not to be considered a success
            expect(wrapper.stepFinished[wrapper.stepIndex])
                .toBeFalse();
        }));
    });
    describe('TutorialStep awaiting any move', () => {
        it('should consider any move legal when step is anyMove', fakeAsync(async() => {
            // Given tutorial step fo type "anyMove"
            const tutorial: TutorialStep[] = [
                TutorialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    new QuartoMove(0, 0, QuartoPiece.BABA),
                    'Congratulations!',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing any move
            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', move);
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Congratulations!';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
    });
    describe('TutorialStep awaiting a click', () => {
        it('should show success message after step success (one of several clics)', fakeAsync(async() => {
            // Given a TutorialStep with several clics
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'Click on (0, 0) or (3, 3)',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing that move
            await testUtils.expectClickSuccess('#chooseCoord_0_0');

            // expect to see steps success message on component
            const expectedMessage: string = 'Congratulations!';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should show failure message after step failure (one of several clics)', fakeAsync(async() => {
            // Given a TutorialStep with several clics
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'Click on (0, 0) or (3, 3)',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing another move
            await testUtils.expectClickSuccess('#chooseCoord_1_1');

            // expect to see steps success message on component
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should show restart button (with possibility of seeing solution) when unwanted click with no move is done', fakeAsync(async() => {
            // Given a TutorialStep with possible invalid clicks
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0.',
                    new QuartoState([
                        [QuartoPiece.AAAA, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                        [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
                    ], 0, QuartoPiece.ABBA),
                    ['#chooseCoord_3_3'],
                    'Congratulations!',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing invalid click
            await testUtils.expectClickFailure('#chooseCoord_0_0', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());

            // Then the failure reason should be shown
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const currentReason: string =
                testUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
            // And then solution button should be shown too
            testUtils.expectElementToExist('#showSolutionButton');
        }));
        it('should show solution when asking for it', fakeAsync(async() => {
            // Given a TutorialStep for clicks, for which the user clicked wrongly
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'Click on (0, 0)',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            // This click is legal, however it is not the one expected by the tutorial!
            await testUtils.expectClickSuccess('#chooseCoord_1_1');

            // When clicking on 'see solution'
            await testUtils.clickElement('#showSolutionButton');
            testUtils.detectChanges();

            // Then the actual click is performed and the solution message is shown
            testUtils.expectElementToExist('#selected');
            const expectedMessage: string = 'Bravo !';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
    });
    describe('Informational TutorialStep', () => {
        it('should forbid clicking on the board', fakeAsync(async() => {
            // Given a TutorialStep on which nothing is awaited
            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When clicking
            await testUtils.expectClickForbidden('#chooseCoord_2_2', TutorialFailure.INFORMATIONAL_STEP());

            // expect to see still the steps success message on component
            const expectedMessage: string = 'instruction 0';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('should mark step as finished when skipped', fakeAsync(async() => {
            // Given a TutorialStep with no action to do
            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title',
                    'Explanation Explanation Explanation.',
                    QuartoState.getInitialState(),
                ),
                TutorialStep.informational(
                    'title',
                    'Suite suite.',
                    QuartoState.getInitialState(),
                ),
            ];
            wrapper.startTutorial(tutorial);
            // When clicking "Next Button"
            const nextButtonMessage: string =
                testUtils.findElement('#nextButton').nativeElement.textContent;
            expect(nextButtonMessage).toBe('Ok');
            await testUtils.clickElement('#nextButton');

            // expect to see next step on component
            const expectedMessage: string = 'Suite suite.';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            expect(wrapper.stepFinished[0]).toBeTrue();
        }));
    });
    describe('TutorialStep awaiting a predicate', () => {
        it('should display MGPValidation.reason when predicate return a failure', fakeAsync(async() => {
            // Given a TutorialStep that always fail
            const tutorial: TutorialStep[] = [
                TutorialStep.fromPredicate(
                    'title',
                    'You shall not pass',
                    QuartoState.getInitialState(),
                    new QuartoMove(1, 1, QuartoPiece.BAAB),
                    (_move: QuartoMove, _resultingState: QuartoState) => {
                        return MGPValidation.failure('chocolatine');
                    },
                    'Congratulations!',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing a move
            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', move);
            tick(10);

            // expect to see steps success message on component
            const expectedReason: string = 'chocolatine';
            const currentReason: string =
                testUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
        }));
        it('should display successMessage when predicate return MGPValidation.SUCCESS', fakeAsync(async() => {
            // Given a TutorialStep with several clics
            const tutorial: TutorialStep[] = [
                TutorialStep.fromPredicate(
                    'title',
                    'No matter what you do, it will be success!',
                    QuartoState.getInitialState(),
                    new QuartoMove(1, 1, QuartoPiece.BAAB),
                    (_move: QuartoMove, _resultingState: QuartoState) => {
                        return MGPValidation.SUCCESS;
                    },
                    'Congratulations!',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing a move
            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', move);
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Congratulations!';
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
    });
    describe('showSolution', () => {
        it('should work with Tutorial step other than "list of moves"', fakeAsync(async() => {
            // Given a TutorialStep on which we failed to success
            const solutionMove: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAB);
            const tutorial: TutorialStep[] = [
                TutorialStep.fromPredicate(
                    'title',
                    'You will have to ask me for solution anyway',
                    QuartoState.getInitialState(),
                    solutionMove,
                    (_move: QuartoMove, _resultingState: QuartoState) => {
                        return MGPValidation.failure('what did I say ?');
                    },
                    'Congratulations!',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await testUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const proposedMove: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await testUtils.expectMoveSuccess('#choosePiece_15', proposedMove);
            tick(10);

            // When clicking "Show Solution"
            await testUtils.clickElement('#showSolutionButton');

            // Expect the step proposed move to have been done
            expect(testUtils.getComponent().node.move.get()).toEqual(solutionMove);
            expect(testUtils.getComponent().getTurn()).toEqual(1);
            // expect 'solution' message to be shown
            const currentMessage: string =
                testUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Congratulations!');
            // expect step not to be considered a success
            expect(wrapper.stepFinished[wrapper.stepIndex]).toBeFalse();
        }));
    });
});
