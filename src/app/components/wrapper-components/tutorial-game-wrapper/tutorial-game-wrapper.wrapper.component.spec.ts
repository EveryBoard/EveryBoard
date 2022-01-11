/* eslint-disable max-lines-per-function */
import { TutorialGameWrapperComponent } from './tutorial-game-wrapper.component';
import { TutorialStep } from './TutorialStep';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoState } from 'src/app/games/quarto/QuartoState';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { ComponentTestUtils, TestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { TutorialFailure } from './TutorialFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Move } from 'src/app/jscaip/Move';
import { Coord } from 'src/app/jscaip/Coord';
import { Rules } from 'src/app/jscaip/Rules';
import { Direction } from 'src/app/jscaip/Direction';
import { GameInfo } from '../../normal-component/pick-game/pick-game.component';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { Router } from '@angular/router';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from 'src/app/jscaip/GameState';
import { Utils } from 'src/app/utils/utils';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';

import { ApagosTutorial } from 'src/app/games/apagos/ApagosTutorial';
import { ApagosRules } from 'src/app/games/apagos/ApagosRules';
import { ApagosState } from 'src/app/games/apagos/ApagosState';
import { ApagosMove } from 'src/app/games/apagos/ApagosMove';
import { ApagosCoord } from 'src/app/games/apagos/ApagosCoord';
import { ConspirateursTutorial } from 'src/app/games/conspirateurs/ConspirateursTutorial';
import { ConspirateursRules } from 'src/app/games/conspirateurs/ConspirateursRules';
import { ConspirateursMoveSimple, ConspirateursMoveJump } from 'src/app/games/conspirateurs/ConspirateursMove';
import { DvonnRules } from 'src/app/games/dvonn/DvonnRules';
import { DvonnTutorial } from 'src/app/games/dvonn/DvonnTutorial';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnState } from 'src/app/games/dvonn/DvonnState';
import { EncapsuleRules } from 'src/app/games/encapsule/EncapsuleRules';
import { EncapsuleState } from 'src/app/games/encapsule/EncapsuleState';
import { EncapsuleTutorial } from 'src/app/games/encapsule/EncapsuleTutorial';
import { EncapsuleMove } from 'src/app/games/encapsule/EncapsuleMove';
import { EncapsulePiece } from 'src/app/games/encapsule/EncapsulePiece';
import { EpaminondasRules } from 'src/app/games/epaminondas/EpaminondasRules';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { EpaminondasTutorial } from '../../../games/epaminondas/EpaminondasTutorial';
import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { PentagoRules } from 'src/app/games/pentago/PentagoRules';
import { PentagoState } from 'src/app/games/pentago/PentagoState';
import { PentagoTutorial } from 'src/app/games/pentago/PentagoTutorial';
import { PentagoMove } from 'src/app/games/pentago/PentagoMove';
import { PylosRules } from 'src/app/games/pylos/PylosRules';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { PylosTutorial } from 'src/app/games/pylos/PylosTutorial';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { SaharaTutorial } from '../../../games/sahara/SaharaTutorial';
import { SaharaRules } from 'src/app/games/sahara/SaharaRules';
import { SaharaState } from 'src/app/games/sahara/SaharaState';
import { SaharaMove } from 'src/app/games/sahara/SaharaMove';
import { SixMove } from 'src/app/games/six/SixMove';
import { SixRules } from 'src/app/games/six/SixRules';
import { SixState } from 'src/app/games/six/SixState';
import { SixTutorial, SixTutorialMessages } from '../../../games/six/SixTutorial';
import { YinshRules } from 'src/app/games/yinsh/YinshRules';
import { YinshState } from 'src/app/games/yinsh/YinshState';
import { YinshTutorial, YinshTutorialMessages } from 'src/app/games/yinsh/YinshTutorial';
import { YinshCapture, YinshMove } from 'src/app/games/yinsh/YinshMove';

describe('TutorialGameWrapperComponent (wrapper)', () => {

    let componentTestUtils: ComponentTestUtils<QuartoComponent>;
    let wrapper: TutorialGameWrapperComponent;

    beforeEach(fakeAsync(async() => {
        componentTestUtils =
            await ComponentTestUtils.forGame<QuartoComponent>('Quarto', TutorialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as TutorialGameWrapperComponent;
    }));
    describe('Common behavior', () => {
        // ///////////////////////// BEFORE ///////////////////////////////////////
        it('should create', () => {
            expect(componentTestUtils.wrapper).toBeTruthy();
            expect(componentTestUtils.getComponent()).toBeTruthy();
        });
        it('Should show informations bellow/beside the board', fakeAsync(async() => {
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
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            // when starting tutorial
            wrapper.startTutorial(tutorial);

            // expect to see step instruction on component
            const expectedMessage: string = 'instruction';
            const currentMessage: string = componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const actualState: QuartoState = componentTestUtils.getComponent().rules.node.gameState;
            expect(actualState).toEqual(state);
        }));
        it('Should show previousMove when set', fakeAsync(async() => {
            // Given a certain TutorialStep
            const state: QuartoState = new QuartoState([
                [QuartoPiece.AAAA, QuartoPiece.AAAA, QuartoPiece.AAAA, QuartoPiece.AAAA],
                [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.AABB],
                [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.AABB],
                [QuartoPiece.AAAA, QuartoPiece.AAAB, QuartoPiece.AABA, QuartoPiece.AABB],
            ], 0, QuartoPiece.BBAA);
            const expectedPreviousMove: QuartoMove = new QuartoMove(1, 1, QuartoPiece.AAAB);
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'instruction',
                    state,
                    ['#click_0_0'],
                    'Bravo !',
                    'Perdu.',
                ).withPreviousMove(expectedPreviousMove),
            ];
            // when starting tutorial
            wrapper.startTutorial(tutorial);

            // expect to see setted previous move
            const actualMove: QuartoMove = wrapper.gameComponent.rules.node.move.get() as QuartoMove;
            expect(expectedPreviousMove).toEqual(actualMove);
        }));
        it('Should show title of the steps, the selected one in bold', fakeAsync(async() => {
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
            // when page rendered
            wrapper.startTutorial(tutorial);

            // expect to see three "li" with step title
            let expectedTitle: string = 'title 0';
            let currentTitle: string = componentTestUtils.findElement('#step_0').nativeElement.innerHTML;
            expect(currentTitle).toBe(expectedTitle);
            expectedTitle = 'title 1';
            currentTitle = componentTestUtils.findElement('#step_1').nativeElement.innerHTML;
            expect(currentTitle).toBe(expectedTitle);
        }));
        // ///////////////////////// ATTEMPTING ///////////////////////////////////
        it('Should go to specific step when clicking on it', fakeAsync(async() => {
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

            // when selecting a step
            const stepSelection: HTMLSelectElement = componentTestUtils.findElement('#steps').nativeElement;
            stepSelection.value = stepSelection.options[2].value;
            stepSelection.dispatchEvent(new Event('change'));
            componentTestUtils.detectChanges();

            // expect to have the step 2 shown
            const expectedMessage: string = 'instruction 2';
            const currentMessage: string = componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        // ///////////////////// Retry ///////////////////////////////////////////////////////////////////
        it('Should start step again after clicking "retry" on step failure', fakeAsync(async() => {
            // Given any TutorialStep where an invalid move has been done
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.expectClickSuccess('#choosePiece_8');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAA);
            await componentTestUtils.expectMoveSuccess('#chooseCoord_1_1', move, QuartoState.getInitialState());
            tick(10);

            // when clicking retry
            await componentTestUtils.clickElement('#retryButton');

            // expect to see steps instruction message on component and board restarted
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('instruction');
            expect(componentTestUtils.getComponent().rules.node.gameState)
                .toEqual(QuartoState.getInitialState());
        }));
        it('Should start step again after clicking "retry" on step success', fakeAsync(async() => {
            // Given any TutorialStep
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            // when doing another move, then clicking retry
            await componentTestUtils.expectClickSuccess('#choosePiece_15');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#chooseCoord_0_0', move, QuartoState.getInitialState());
            tick(10);
            await componentTestUtils.clickElement('#retryButton');

            // expect to see steps instruction message on component and board restarted
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('instruction');
            expect(componentTestUtils.getComponent().rules.node.gameState)
                .toEqual(QuartoState.getInitialState());
        }));
        it('Should forbid clicking again on the board after success', fakeAsync(async() => {
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
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoState.getInitialState());
            tick(10);

            // when clicking again
            await componentTestUtils.expectClickForbidden('#chooseCoord_2_2', TutorialFailure.STEP_FINISHED());
            tick(10);

            // expect to see still the steps success message on component
            const expectedMessage: string = 'Bravo !';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should allow clicking again after restarting succeeded steps', fakeAsync(async() => {
            // Given any TutorialStep whose step has been succeeded and restarted
            wrapper.steps = [
                TutorialStep.forClick(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    ['#choosePiece_15'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            await componentTestUtils.expectClickSuccess('#choosePiece_15');
            await componentTestUtils.clickElement('#retryButton');

            // When trying again
            await componentTestUtils.expectClickSuccess('#choosePiece_15');

            // expect to see success message again
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Bravo !');
            expect(componentTestUtils.getComponent().rules.node.gameState)
                .toEqual(QuartoState.getInitialState());
        }));
        // /////////////////////// Next /////////////////////////////////////////////////////////
        it('Should allow to skip step', fakeAsync(async() => {
            // Given a TutorialStep with one clic
            wrapper.steps = [
                TutorialStep.forClick(
                    'title',
                    'Explanation Explanation Explanation.',
                    QuartoState.getInitialState(),
                    ['chooseCoord_0_0'],
                    'Bravo !',
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
            // when clicking "Skip"
            await componentTestUtils.clickElement('#nextButton');

            // expect to see next step on component
            const expectedMessage: string = 'Following Following Following.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            expect(wrapper.stepFinished[0]).toBeFalse();
        }));
        it('Should move to the next unfinished step when next step is finished', fakeAsync(async() => {
            // Given a tutorial on which the two first steps have been skipped
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Bravo !',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 1',
                    'instruction 1',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_1_1'],
                    'Bravo !',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 2',
                    'instruction 2',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_2_2'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.clickElement('#nextButton');
            await componentTestUtils.clickElement('#nextButton');
            await componentTestUtils.expectClickSuccess('#chooseCoord_2_2');

            // When clicking next
            await componentTestUtils.clickElement('#nextButton');

            // expect to be back at first step
            const expectedMessage: string = 'instruction 0';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should move to the first unfinished step when all next steps are finished', fakeAsync(async() => {
            // Given a tutorial on which the middle steps have been skipped
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Bravo !',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 1',
                    'instruction 1',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_1_1'],
                    'Bravo !',
                    'Perdu.',
                ),
                TutorialStep.forClick(
                    'title 2',
                    'instruction 2',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_2_2'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.clickElement('#nextButton'); // Go to 1
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1'); // Do 1
            await componentTestUtils.clickElement('#nextButton'); // Go to 2
            await componentTestUtils.clickElement('#nextButton'); // Go to 0

            // When clicking next
            await componentTestUtils.clickElement('#nextButton'); // Should go to 2

            // expect to be back at first step
            const expectedMessage: string = 'instruction 2';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should show congratulation and play buttons at the end of the tutorial, hide next button', fakeAsync(async() => {
            // Given a TutorialStep whose last step has been done
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');

            // when clicking next button
            await componentTestUtils.clickElement('#nextButton');

            // expect to see end tutorial congratulations
            const expectedMessage: string = wrapper.COMPLETED_TUTORIAL_MESSAGE;
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(wrapper.successfulSteps).toBe(1);
            expect(currentMessage).toBe(expectedMessage);
            // expect next button to be hidden
            componentTestUtils.expectElementNotToExist('#nextButton');
            // expect retry button to be hidden
            componentTestUtils.expectElementNotToExist('#retryButton');
            // expect restart button to be here
            await componentTestUtils.clickElement('#restartButton');
            expect(wrapper.successfulSteps).toBe(0);
        }));
        it('Should allow to restart the whole tutorial when finished', fakeAsync(async() => {
            // Given a finished tutorial
            wrapper.startTutorial([
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ]);
            await componentTestUtils.clickElement('#nextButton');

            // when clicking restart
            await componentTestUtils.clickElement('#restartButton');

            // expect to be back on first step
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(wrapper.steps[0].instruction);
            expect(wrapper.stepFinished.every((v: boolean) => v === false)).toBeTrue();
            expect(wrapper.stepIndex).toEqual(0);
        }));
        it('Should redirect to local game when asking for it when finished', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            // Given a finish tutorial
            wrapper.startTutorial([
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ]);
            componentTestUtils.expectElementNotToExist('#playLocallyButton');
            await componentTestUtils.clickElement('#nextButton');

            // when clicking play locally
            spyOn(router, 'navigate').and.callThrough();
            await componentTestUtils.clickElement('#playLocallyButton');

            // expect navigator to have been called
            expect(router.navigate).toHaveBeenCalledWith(['local/Quarto']);
        }));
        it('Should redirect to online game when asking for it when finished and user is online', fakeAsync(async() => {
            // Given a finish tutorial
            wrapper.startTutorial([
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ]);
            componentTestUtils.expectElementNotToExist('#playOnlineButton');
            await componentTestUtils.clickElement('#nextButton');

            // when clicking play locally
            const compo: TutorialGameWrapperComponent =
                componentTestUtils.wrapper as TutorialGameWrapperComponent;
            spyOn(compo.gameService, 'createGameAndRedirectOrShowError').and.callThrough();
            await componentTestUtils.clickElement('#playOnlineButton');

            // expect navigator to have been called
            expect(compo.gameService.createGameAndRedirectOrShowError).toHaveBeenCalledWith('Quarto');

            tick(3000); // needs to be >2999
        }));
    });
    describe('TutorialStep awaiting specific moves', () => {
        it('Should show highlight of first click on multiclick game component', fakeAsync(async() => {
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
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing that move
            await componentTestUtils.expectClickSuccess('#chooseCoord_3_3');
            tick(11);

            // expect highlight to be present
            componentTestUtils.expectElementToExist('#highlight');
        }));
        it('Should show success message after step success', fakeAsync(async() => {
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
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing that move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoState.getInitialState());
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo !';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should show failure message after step failure', fakeAsync(async() => {
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
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing another move
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoState.getInitialState());
            tick(10);

            // expect to see steps success message on component
            const expectedReason: string = 'Perdu.';
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
        }));
        it('When illegal move is done, toast message should be shown and restart not needed', fakeAsync(async() => {
            // given tutorial awaiting any move, but mocking rules to make it mark a move illegal
            const tutorial: TutorialStep[] = [
                TutorialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    new QuartoMove(0, 0, QuartoPiece.BABA),
                    'Bravo !',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing a (virtually) illegal move
            const error: string = 'some error message...';
            spyOn(wrapper.gameComponent.rules, 'isLegal').and.returnValue(MGPFallible.failure(error));
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveFailure('#choosePiece_15', error, move);
            tick(10);

            // expect to see message error
            const expectedReason: string = error;
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
        }));
        it('When illegal click is tried, toast message should be shown and restart not needed', fakeAsync(async() => {
            // Given a TutorialStep on which illegal move has been tried
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title 0',
                    'instruction 0.',
                    new QuartoState([
                        [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                    ], 0, QuartoPiece.ABBA),
                    [new QuartoMove(3, 3, QuartoPiece.BBBB)],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.expectClickFailure('#chooseCoord_0_0', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
            tick(10);

            // expect to see cancelMove reason as message
            const expectedMessage: string = 'instruction 0.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
            // expect click to be still possible
            expect(componentTestUtils.getComponent().canUserPlay('#chooseCoord_0_0').isSuccess()).toBeTrue();
            tick(10);
        }));
        it('should not show error if cancelMove is called with no specified reason', fakeAsync(async() => {
            // given a tutorial awaiting a move
            const tutorial: TutorialStep[] = [
                TutorialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    new QuartoMove(0, 0, QuartoPiece.BABA),
                    'Bravo !',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when cancelMove is called with no specified reason
            wrapper.gameComponent.cancelMove();

            // then no error is shown
            componentTestUtils.expectElementNotToExist('#currentReason');
        }));
        it('Should propose to see the solution when move attempt done', fakeAsync(async() => {
            // Given a tutorial on which a non-awaited move has been done
            const awaitedMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BBAA);
            const stepInitialTurn: number = 0;
            const tutorial: TutorialStep[] = [
                TutorialStep.fromMove(
                    'title 0',
                    'instruction 0.',
                    new QuartoState([
                        [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                    ], stepInitialTurn, QuartoPiece.ABBA),
                    [awaitedMove],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAA);
            await componentTestUtils.expectMoveSuccess('#choosePiece_8', move);
            tick(10);
            expect(wrapper.moveAttemptMade).toBeTrue();
            expect(wrapper.stepFinished[wrapper.stepIndex])
                .toBeFalse();

            // When clicking "Show Solution"
            await componentTestUtils.clickElement('#showSolutionButton');

            // Expect the first awaited move to have been done
            expect(componentTestUtils.getComponent().rules.node.move.get()).toEqual(awaitedMove);
            expect(componentTestUtils.getComponent().rules.node.gameState.turn).toEqual(stepInitialTurn + 1);
            // expect 'solution' message to be shown
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Bravo !');
            // expect step not to be considered a success
            expect(wrapper.stepFinished[wrapper.stepIndex])
                .toBeFalse();
        }));
    });
    describe('TutorialStep awaiting any move', () => {
        it('Should consider any move legal when step is anyMove', fakeAsync(async() => {
            // given tutorial step fo type "anyMove"
            const tutorial: TutorialStep[] = [
                TutorialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoState.getInitialState(),
                    new QuartoMove(0, 0, QuartoPiece.BABA),
                    'Bravo !',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing any move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoState.getInitialState());
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo !';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
    });
    describe('TutorialStep awaiting a click (deprecated)', () => {
        it('Should show success message after step success (one of several clics)', fakeAsync(async() => {
            // Given a TutorialStep with several clics
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'Click on (0, 0) or (3, 3)',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing that move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo !';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should show failure message after step failure (one of several clics)', fakeAsync(async() => {
            // Given a TutorialStep with several clics
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title',
                    'Click on (0, 0) or (3, 3)',
                    QuartoState.getInitialState(),
                    ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing another move
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1');

            // expect to see steps success message on component
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('When unwanted click, and no move done, restart should not be needed', fakeAsync(async() => {
            // Given a TutorialStep with possible invalid clicks
            const tutorial: TutorialStep[] = [
                TutorialStep.forClick(
                    'title 0',
                    'instruction 0.',
                    new QuartoState([
                        [QuartoPiece.AAAA, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                        [QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE, QuartoPiece.NONE],
                    ], 0, QuartoPiece.ABBA),
                    ['#chooseCoord_3_3'],
                    'Bravo !',
                    'Perdu.',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // When doing invalid click
            await componentTestUtils.expectClickFailure('#chooseCoord_0_0', RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());

            // expect to see cancelMove reason as message
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(RulesFailure.MUST_CLICK_ON_EMPTY_SPACE());
            // expect click to be still possible
            expect(componentTestUtils.getComponent().canUserPlay('#chooseCoord_0_0').isSuccess()).toBeTrue();
        }));
    });
    describe('Informational TutorialStep', () => {
        it('Should forbid clicking on the board', fakeAsync(async() => {
            // Given a TutorialStep on which nothing is awaited
            const tutorial: TutorialStep[] = [
                TutorialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoState.getInitialState(),
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when clicking
            await componentTestUtils.expectClickForbidden('#chooseCoord_2_2', TutorialFailure.INFORMATIONAL_STEP());

            // expect to see still the steps success message on component
            const expectedMessage: string = 'instruction 0';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should mark step as finished when skipped', fakeAsync(async() => {
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
            // when clicking "Next Button"
            const nextButtonMessage: string =
                componentTestUtils.findElement('#nextButton').nativeElement.textContent;
            expect(nextButtonMessage).toBe('Ok');
            await componentTestUtils.clickElement('#nextButton');

            // expect to see next step on component
            const expectedMessage: string = 'Suite suite.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            expect(wrapper.stepFinished[0]).toBeTrue();
        }));
    });
    describe('TutorialStep awaiting a predicate', () => {
        it('Should display MGPValidation.reason when predicate return a failure', fakeAsync(async() => {
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
                    'Bravo !',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing a move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoState.getInitialState());
            tick(10);

            // expect to see steps success message on component
            const expectedReason: string = 'chocolatine';
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
        }));
        it('Should display successMessage when predicate return MGPValidation.SUCCESS', fakeAsync(async() => {
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
                    'Bravo !',
                ),
            ];
            wrapper.startTutorial(tutorial);

            // when doing a move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoState.getInitialState());
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo !';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
    });
    describe('showSolution', () => {
        it('Should work with Tutorial step other than "list of moves"', fakeAsync(async() => {
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
                    'Bravo !',
                ),
            ];
            wrapper.startTutorial(tutorial);
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const proposedMove: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', proposedMove, QuartoState.getInitialState());
            tick(10);

            // When clicking "Show Solution"
            await componentTestUtils.clickElement('#showSolutionButton');

            // Expect the step proposed move to have been done
            expect(componentTestUtils.getComponent().rules.node.move.get()).toEqual(solutionMove);
            expect(componentTestUtils.getComponent().rules.node.gameState.turn).toEqual(1);
            // expect 'solution' message to be shown
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Bravo !');
            // expect step not to be considered a success
            expect(wrapper.stepFinished[wrapper.stepIndex]).toBeFalse();
        }));
    });
    describe('Tutorials', () => {
        it('Should make sure that predicate step have healthy behaviors', fakeAsync(async() => {
            const apagosTutorial: TutorialStep[] = new ApagosTutorial().tutorial;
            const conspirateursTutorial: TutorialStep[] = new ConspirateursTutorial().tutorial;
            const dvonnTutorial: TutorialStep[] = new DvonnTutorial().tutorial;
            const encapsuleTutorial: TutorialStep[] = new EncapsuleTutorial().tutorial;
            const epaminondasTutorial: TutorialStep[] = new EpaminondasTutorial().tutorial;
            const pentagoTutorial: TutorialStep[] = new PentagoTutorial().tutorial;
            const pylosTutorial: TutorialStep[] = new PylosTutorial().tutorial;
            const saharaTutorial: TutorialStep[] = new SaharaTutorial().tutorial;
            const sixTutorial: TutorialStep[] = new SixTutorial().tutorial;
            const yinshTutorial: TutorialStep[] = new YinshTutorial().tutorial;
            const stepExpectations: [Rules<Move, GameState, unknown>, TutorialStep, Move, MGPValidation][] = [
                [
                    new ApagosRules(ApagosState),
                    apagosTutorial[2],
                    ApagosMove.drop(ApagosCoord.ZERO, Player.ZERO),
                    MGPValidation.failure(`This move is a drop, please do a transfer!`),
                ],
                [
                    new ApagosRules(ApagosState),
                    apagosTutorial[3],
                    ApagosMove.drop(ApagosCoord.TWO, Player.ZERO),
                    MGPValidation.failure(`You actively made your opponent win!`),
                ],
                [
                    new ApagosRules(ApagosState),
                    apagosTutorial[3],
                    ApagosMove.transfer(ApagosCoord.THREE, ApagosCoord.TWO).get(),
                    MGPValidation.failure(`Wrong choice, your opponent will win in the next turn no matter which piece is dropped!`),
                ],
                [
                    ConspirateursRules.get(),
                    conspirateursTutorial[2],
                    ConspirateursMoveJump.of([new Coord(4, 7), new Coord(4, 5)]).get(),
                    MGPValidation.failure(`You have made a jump, not a simple move. Try again!`),
                ],
                [
                    ConspirateursRules.get(),
                    conspirateursTutorial[3],
                    ConspirateursMoveSimple.of(new Coord(4, 6), new Coord(4, 5)).get(),
                    MGPValidation.failure(`You have not performed a jump. Try again!`),
                ],
                [
                    new DvonnRules(DvonnState),
                    dvonnTutorial[1],
                    DvonnMove.of(new Coord(2, 1), new Coord(3, 0)),
                    MGPValidation.failure(`You have successfully disconnected the stack of 4 pieces of your opponent, but on the next move your opponent will be able to move on your new stack, and to win the game! There exists a better outcome of this situation, try to find it.`),
                ], [
                    new DvonnRules(DvonnState),
                    dvonnTutorial[2],
                    DvonnMove.of(new Coord(2, 1), new Coord(1, 1)),
                    MGPValidation.failure(`You have not taken possession of a source, try again.`),
                ], [
                    new EncapsuleRules(EncapsuleState),
                    encapsuleTutorial[3],
                    EncapsuleMove.fromDrop(EncapsulePiece.BIG_BLACK, new Coord(0, 2)),
                    MGPValidation.failure(`You won, but the exercise is to win while moving a piece!`),
                ], [
                    new EncapsuleRules(EncapsuleState),
                    encapsuleTutorial[3],
                    EncapsuleMove.fromMove(new Coord(0, 0), new Coord(0, 2)),
                    MGPValidation.failure(`Failed. Try again.`),
                ], [
                    new EncapsuleRules(EncapsuleState),
                    encapsuleTutorial[3],
                    EncapsuleMove.fromMove(new Coord(0, 0), new Coord(1, 0)),
                    MGPValidation.failure(`Failed. Try again.`),
                ], [
                    new EpaminondasRules(EpaminondasState),
                    epaminondasTutorial[3],
                    new EpaminondasMove(0, 11, 2, 1, Direction.UP),
                    MGPValidation.failure(`Congratulations, you are in advance. But this is not the exercise here, try again.`),
                ], [
                    new EpaminondasRules(EpaminondasState),
                    epaminondasTutorial[4],
                    new EpaminondasMove(0, 10, 1, 1, Direction.UP),
                    MGPValidation.failure(`Failed! You moved only one piece.`),
                ], [
                    new PentagoRules(PentagoState),
                    pentagoTutorial[2],
                    PentagoMove.withRotation(0, 0, 0, true),
                    MGPValidation.failure(`You have made a move with a rotation. This tutorial step is about moves without rotations!`),
                ], [
                    new PentagoRules(PentagoState),
                    pentagoTutorial[3],
                    PentagoMove.rotationless(0, 0),
                    MGPValidation.failure(`You made a move without rotation, try again!`),
                ], [
                    new PylosRules(PylosState),
                    pylosTutorial[4],
                    PylosMove.fromDrop(new PylosCoord(3, 3, 0), []),
                    MGPValidation.failure(`Failed, you did not capture any piece.`),
                ], [
                    new PylosRules(PylosState),
                    pylosTutorial[4],
                    PylosMove.fromDrop(new PylosCoord(0, 1, 0), [new PylosCoord(0, 0, 0)]),
                    MGPValidation.failure(`Failed, you only captured one piece.`),
                ], [
                    new SaharaRules(SaharaState),
                    saharaTutorial[2],
                    SaharaMove.from(new Coord(7, 0), new Coord(5, 0)).get(),
                    MGPValidation.failure(`You have made a double step, which is good but it is the next exercise!`),
                ], [
                    new SaharaRules(SaharaState),
                    saharaTutorial[3],
                    SaharaMove.from(new Coord(2, 0), new Coord(2, 1)).get(),
                    MGPValidation.failure(`Failed! You have made a single step.`),
                ], [
                    new SixRules(SixState),
                    sixTutorial[4],
                    SixMove.fromMovement(new Coord(6, 1), new Coord(7, 1)),
                    MGPValidation.failure(SixTutorialMessages.MOVEMENT_NOT_DISCONNECTING()),
                ], [
                    new SixRules(SixState),
                    sixTutorial[4],
                    SixMove.fromMovement(new Coord(6, 1), new Coord(6, 0)),
                    MGPValidation.failure(SixTutorialMessages.MOVEMENT_SELF_DISCONNECTING()),
                ], [
                    new SixRules(SixState),
                    sixTutorial[5],
                    SixMove.fromMovement(new Coord(0, 6), new Coord(1, 6)),
                    MGPValidation.failure(`This move does not disconnect your opponent's pieces. Try again with another piece.`),
                ], [
                    new SixRules(SixState),
                    sixTutorial[6],
                    SixMove.fromMovement(new Coord(2, 3), new Coord(3, 3)),
                    MGPValidation.failure(`This move has not cut the board in two equal halves.`),
                ], [
                    new SixRules(SixState),
                    sixTutorial[6],
                    SixMove.fromCut(new Coord(2, 3), new Coord(1, 3), new Coord(3, 2)),
                    MGPValidation.failure(`Failed. You did cut the board in two but you kept the half where you're in minority. Therefore, you lost! Try again.`),
                ], [
                    new YinshRules(YinshState),
                    yinshTutorial[3],
                    new YinshMove([], new Coord(4, 4), MGPOptional.of(new Coord(1, 4)), []),
                    MGPValidation.failure(YinshTutorialMessages.MUST_ALIGN_FIVE()),
                ], [
                    new YinshRules(YinshState),
                    yinshTutorial[4],
                    new YinshMove([YinshCapture.of(new Coord(5, 4), new Coord(5, 8), new Coord(3, 2))],
                                  new Coord(4, 1), MGPOptional.of(new Coord(6, 1)),
                                  []),
                    MGPValidation.failure(YinshTutorialMessages.MUST_CAPTURE_TWO()),
                ],
            ];
            for (const stepExpectation of stepExpectations) {
                const rules: Rules<Move, GameState, unknown> = stepExpectation[0];
                const step: TutorialStep = stepExpectation[1];
                const move: Move = stepExpectation[2];
                const validation: MGPValidation = stepExpectation[3];
                const moveResult: MGPFallible<unknown> = rules.isLegal(move, step.state);
                if (moveResult.isSuccess()) {
                    const state: GameState = rules.applyLegalMove(move, step.state, moveResult.get());
                    if (step.isPredicate()) {
                        expect(Utils.getNonNullable(step.predicate)(move, state)).toEqual(validation);
                    } else {
                        throw new Error('This test expects only predicate steps');
                    }
                } else {
                    const context: string = 'Move should be legal to reach predicate but failed because';
                    TestUtils.expectValidationSuccess(MGPValidation.ofFallible(moveResult), context);
                }
            }
        }));
        it('Should make sure all solutionMove are legal', fakeAsync(async() => {
            for (const gameInfo of GameInfo.ALL_GAMES()) {
                if (gameInfo.display === false) {
                    continue;
                }
                const gameComponent: AbstractGameComponent =
                    TestBed.createComponent(gameInfo.component).debugElement.componentInstance;
                const rules: Rules<Move, GameState, unknown> = gameComponent.rules;
                const steps: TutorialStep[] = gameComponent.tutorial;
                for (const step of steps) {
                    if (step.hasSolution()) {
                        const moveResult: MGPFallible<unknown> = rules.isLegal(step.getSolution(), step.state);
                        if (moveResult.isSuccess()) {
                            if (step.isPredicate()) {
                                const state: GameState =
                                    rules.applyLegalMove(step.getSolution(), step.state, moveResult.get());
                                expect(Utils.getNonNullable(step.predicate)(step.getSolution(), state))
                                    .toEqual(MGPValidation.SUCCESS);
                            }
                        } else {
                            const context: string = 'Solution move should be legal but failed in "' + step.title + '"';
                            expect(moveResult.getReason()).withContext(context).toBeNull();
                        }
                    }
                }
            }
        }));
    });
});
