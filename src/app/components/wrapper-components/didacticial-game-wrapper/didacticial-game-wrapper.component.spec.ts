import { DidacticialGameWrapperComponent } from './didacticial-game-wrapper.component';
import { DidacticialStep } from './DidacticialStep';
import { QuartoMove } from 'src/app/games/quarto/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { fakeAsync, tick } from '@angular/core/testing';
import { QuartoComponent } from '../../../games/quarto/quarto.component';
import { DebugElement } from '@angular/core';

describe('DidacticialGameWrapperComponent', () => {
    let componentTestUtils: ComponentTestUtils<QuartoComponent>;
    let wrapper: DidacticialGameWrapperComponent;

    beforeEach(fakeAsync(async() => {
        componentTestUtils =
            ComponentTestUtils.forGame<QuartoComponent>('Quarto', DidacticialGameWrapperComponent);
        wrapper = componentTestUtils.wrapper as DidacticialGameWrapperComponent;
    }));
    describe('Common behavior', () => {
        // ///////////////////////// BEFORE ///////////////////////////////////////
        it('should create', () => {
            expect(componentTestUtils.wrapper).toBeTruthy();
            expect(componentTestUtils.getComponent()).toBeTruthy();
        });
        it('Should show informations bellow/beside the board', fakeAsync(async() => {
            // Given a certain DidacticialStep
            const slice: QuartoPartSlice = new QuartoPartSlice([
                [0, 0, 0, 0],
                [0, 1, 2, 3],
                [0, 1, 2, 3],
                [0, 1, 2, 3],
            ], 0, QuartoPiece.BBAA);
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title',
                    'instruction',
                    slice,
                    ['#click_0_0'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            // when starting didacticial
            wrapper.startDidacticial(didacticial);

            // expect to see step instruction on component
            const expectedMessage: string = 'instruction';
            const currentMessage: string = componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const actualSlice: QuartoPartSlice =
                componentTestUtils.getComponent().rules.node.gamePartSlice as QuartoPartSlice;
            expect(actualSlice).toEqual(slice);
        }));
        it('Should show title of the steps, the selected one in bold', fakeAsync(async() => {
            // Given a DidacticialStep with 3 steps
            const didacticial: DidacticialStep[] = [
                DidacticialStep.informational(
                    'title 0',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                ),
                DidacticialStep.informational(
                    'title 1',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                ),
                DidacticialStep.informational(
                    'title 2',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                ),
            ];
            // when page rendered
            wrapper.startDidacticial(didacticial);

            // expect to see three "li" with step title
            let expectedTitle: string = '<span style="color: black;"><b>title 0</b></span>';
            let currentTitle: string = componentTestUtils.findElement('#step_0').nativeElement.innerHTML;
            expect(currentTitle).toBe(expectedTitle);
            expectedTitle = '<span style="color: black;">title 1</span>';
            currentTitle = componentTestUtils.findElement('#step_1').nativeElement.innerHTML;
            expect(currentTitle).toBe(expectedTitle);
        }));
        it('It should throw when trying to reach unexisting game', fakeAsync(async() => {
            componentTestUtils.setRoute('compo', 'IDontExist');
            expect(() => wrapper.getDidacticial()).toThrowError('Unknown Game IDontExist.');
        }));
        // ///////////////////////// ATTEMPTING ///////////////////////////////////
        it('Should go to specific step when clicking on it', fakeAsync(async() => {
            // Given a DidacticialStep with 3 steps
            const didacticial: DidacticialStep[] = [
                DidacticialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoPartSlice.getInitialSlice(),
                ),
                DidacticialStep.informational(
                    'title 1',
                    'instruction 1',
                    QuartoPartSlice.getInitialSlice(),
                ),
                DidacticialStep.informational(
                    'title 2',
                    'instruction 2',
                    QuartoPartSlice.getInitialSlice(),
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when clicking on step 2
            expect(await componentTestUtils.clickElement('#step_2')).toBeTruthy();

            // expect to have the step 2 shown
            const expectedMessage: string = 'instruction 2';
            const currentMessage: string = componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        // ///////////////////// Retry ///////////////////////////////////////////////////////////////////
        it('Should start step again after clicking "retry" on step failure', fakeAsync(async() => {
            // Given any DidacticialStep where an invalid move has been done
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                    [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            await componentTestUtils.expectClickSuccess('#choosePiece_8');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAA);
            await componentTestUtils.expectMoveSuccess('#chooseCoord_1_1', move, QuartoPartSlice.getInitialSlice());
            tick(10);

            // when clicking retry
            expect(await componentTestUtils.clickElement('#retryButton')).toBeTrue();

            // expect to see steps instruction message on component and board restarted
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('instruction');
            expect(componentTestUtils.getComponent().rules.node.gamePartSlice)
                .toEqual(QuartoPartSlice.getInitialSlice());
        }));
        it('Should start step again after clicking "retry" on step success', fakeAsync(async() => {
            // Given any DidacticialStep
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                    [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            // when doing another move, then clicking retry
            await componentTestUtils.expectClickSuccess('#choosePiece_15');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#chooseCoord_0_0', move, QuartoPartSlice.getInitialSlice());
            tick(10);
            expect(await componentTestUtils.clickElement('#retryButton')).toBeTrue();

            // expect to see steps instruction message on component and board restarted
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('instruction');
            expect(componentTestUtils.getComponent().rules.node.gamePartSlice)
                .toEqual(QuartoPartSlice.getInitialSlice());
        }));
        it('Should forbid clicking again on the board after success', fakeAsync(async() => {
            // Given a DidacticialStep on which a valid move has been done.
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoPartSlice.getInitialSlice(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoPartSlice.getInitialSlice());
            tick(10);

            // when clicking again
            await componentTestUtils.expectClickForbidden('#chooseCoord_2_2');
            tick(10);

            // expect to see still the steps success message on component
            const expectedMessage: string = 'Bravo.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should allow clicking again after restarting succeeded steps', fakeAsync(async() => {
            // Given any DidacticialStep whose step has been succeeded and restarted
            wrapper.steps = [
                DidacticialStep.forClick(
                    'title',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                    ['#choosePiece_15'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            await componentTestUtils.expectClickSuccess('#choosePiece_15');
            expect(await componentTestUtils.clickElement('#retryButton')).toEqual(true, 'Retry button should exist');

            // When trying again
            await componentTestUtils.expectClickSuccess('#choosePiece_15');

            // expect to see success message again
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Bravo.');
            expect(componentTestUtils.getComponent().rules.node.gamePartSlice)
                .toEqual(QuartoPartSlice.getInitialSlice());
        }));
        // /////////////////////// Next /////////////////////////////////////////////////////////
        it('Should allow to skip step', fakeAsync(async() => {
            // Given a DidacticialStep with one clic
            wrapper.steps = [
                DidacticialStep.forClick(
                    'title',
                    'Explanation Explanation Explanation.',
                    QuartoPartSlice.getInitialSlice(),
                    ['chooseCoord_0_0'],
                    'Bravo.',
                    'Perdu.',
                ),
                DidacticialStep.forClick(
                    'title',
                    'Following Following Following.',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_0_0'],
                    'Fini.',
                    'Reperdu.',
                ),
            ];
            // when clicking "Skip"
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();

            // expect to see next step on component
            const expectedMessage: string = 'Following Following Following.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            expect(wrapper.stepFinished[0]).toBeFalse();
        }));
        it('Should move to the next unfinished step when next step is finished', fakeAsync(async() => {
            // Given a didacticial on which the two first steps have been skipped
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_0_0'],
                    'Bravo.',
                    'Perdu.',
                ),
                DidacticialStep.forClick(
                    'title 1',
                    'instruction 1',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_1_1'],
                    'Bravo.',
                    'Perdu.',
                ),
                DidacticialStep.forClick(
                    'title 2',
                    'instruction 2',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_2_2'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();
            await componentTestUtils.expectClickSuccess('#chooseCoord_2_2');

            // When clicking next
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();

            // expect to be back at first step
            const expectedMessage: string = 'instruction 0';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should move to the first unfinished step when all next steps are finished', fakeAsync(async() => {
            // Given a didacticial on which the middle steps have been skipped
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_0_0'],
                    'Bravo.',
                    'Perdu.',
                ),
                DidacticialStep.forClick(
                    'title 1',
                    'instruction 1',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_1_1'],
                    'Bravo.',
                    'Perdu.',
                ),
                DidacticialStep.forClick(
                    'title 2',
                    'instruction 2',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_2_2'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue(); // Go to 1
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1'); // Do 1
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue(); // Go to 2
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue(); // Go to 0

            // When clicking next
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue(); // Should go to 2

            // expect to be back at first step
            const expectedMessage: string = 'instruction 2';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should show congratulation at the end of the didacticial, hide next button', fakeAsync(async() => {
            // Given a DidacticialStep whose last step has been done
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title 0',
                    'instruction 0',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_0_0'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');

            // when clicking next button
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();

            // expect to see end tutorial congratulations
            const expectedMessage: string = wrapper.COMPLETED_TUTORIAL_MESSAGE;
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            // expect next button to be hidden
            expect(await componentTestUtils.clickElement('#nextButton')).toBeNull();
            // expect retry button to be hidden
            expect(await componentTestUtils.clickElement('#retryButton')).toBeNull();
            // expect restart button to be here
            expect(await componentTestUtils.clickElement('#restartButton')).toBeTrue();
        }));
        it('Should allow to restart the whole didacticial when finished', fakeAsync(async() => {
            // Given a finish tutorial
            wrapper.startDidacticial([
                DidacticialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoPartSlice.getInitialSlice(),
                ),
                DidacticialStep.informational(
                    'title 1',
                    'instruction 1',
                    QuartoPartSlice.getInitialSlice(),
                ),
            ]);
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();

            // when clicking restart
            expect(await componentTestUtils.clickElement('#restartButton')).toBeTrue();

            // expect to be back on first step
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(wrapper.steps[0].instruction);
            expect(wrapper.stepFinished.every((v: boolean) => v === false)).toBeTrue();
            expect(wrapper.stepIndex).toEqual(0);
        }));
    });
    describe('DidacticialStep awaiting specific moves', () => {
        it('Should show highlight of first click on multiclick game component', fakeAsync(async() => {
            // Given a DidacticialStep with several moves
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoPartSlice.getInitialSlice(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when doing that move
            await componentTestUtils.expectClickSuccess('#chooseCoord_3_3');
            tick(11);

            // expect highlight to be present
            const element: DebugElement = componentTestUtils.findElement('#highlight');
            expect(element).toBeTruthy('Highlight should be present');
        }));
        it('Should show success message after step success', fakeAsync(async() => {
            // Given a DidacticialStep with several moves
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoPartSlice.getInitialSlice(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when doing that move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoPartSlice.getInitialSlice());
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should show failure message after step failure', fakeAsync(async() => {
            // Given a DidacticialStep with several move
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title',
                    'Put your piece in a corner and give the opposite one.',
                    QuartoPartSlice.getInitialSlice(),
                    [
                        new QuartoMove(0, 0, QuartoPiece.BBBB),
                        new QuartoMove(0, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 3, QuartoPiece.BBBB),
                        new QuartoMove(3, 0, QuartoPiece.BBBB),
                    ],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when doing another move
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoPartSlice.getInitialSlice());
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('When illegal move is done, toast message should be shown and restart not needed');

        it('When illegal click is tried, toast message should be shown and restart not needed', fakeAsync(async() => {
            // Given a DidacticialStep on which illegal move has been tried
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title 0',
                    'instruction 0.',
                    new QuartoPartSlice([
                        [0, 16, 16, 16],
                        [16, 16, 16, 16],
                        [16, 16, 16, 16],
                        [16, 16, 16, 16],
                    ], 0, QuartoPiece.ABBA),
                    [new QuartoMove(3, 3, QuartoPiece.BBBB)],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            await componentTestUtils.expectClickFailure('#chooseCoord_0_0', 'Choisissez une case vide.');
            tick(10);

            // expect to see cancelMove reason as message
            const expectedMessage: string = 'instruction 0.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const expectedReason: string = 'Choisissez une case vide.';
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
            // expect click to be still possible
            expect(componentTestUtils.getComponent().canUserPlay('#chooseCoord_0_0').isSuccess()).toBeTrue();
            tick(10);
        }));
        it('Should propose to see the solution When move attempt done', fakeAsync(async() => {
            // Given a didacticial on which a non-awaited move has been done
            const awaitedMove: QuartoMove = new QuartoMove(3, 3, QuartoPiece.BBAA);
            const stepInitialTurn: number = 0;
            const didacticial: DidacticialStep[] = [
                DidacticialStep.fromMove(
                    'title 0',
                    'instruction 0.',
                    new QuartoPartSlice([
                        [0, 16, 16, 16],
                        [16, 16, 16, 16],
                        [16, 16, 16, 16],
                        [16, 16, 16, 16],
                    ], stepInitialTurn, QuartoPiece.ABBA),
                    [awaitedMove],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1');
            tick(10);
            const move: QuartoMove = new QuartoMove(1, 1, QuartoPiece.BAAA);
            await componentTestUtils.expectMoveSuccess('#choosePiece_8', move);
            tick(10);
            expect(wrapper.moveAttemptMade).toBeTrue();
            expect(wrapper.stepFinished[wrapper.stepIndex])
                .toBeFalse();

            // When clicking "Show Solution"
            expect(await componentTestUtils.clickElement('#showSolutionButton')).toBeTrue();

            // Expect the first awaited move to have been done
            expect(componentTestUtils.getComponent().rules.node.move).toEqual(awaitedMove);
            expect(componentTestUtils.getComponent().rules.node.gamePartSlice.turn).toEqual(stepInitialTurn + 1);
            // expect 'solution' message to be shown
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe('Bravo.');
            // expect step not to be considered a success
            expect(wrapper.stepFinished[wrapper.stepIndex])
                .toBeFalse();
        }));
    });
    describe('DidacticialStep awaiting any move', () => {
        it('Should consider any move legal when step is anyMove', fakeAsync(async() => {
            // given didacticial step fo type "anyMove"
            const didacticial: DidacticialStep[] = [
                DidacticialStep.anyMove(
                    'title',
                    'instruction',
                    QuartoPartSlice.getInitialSlice(),
                    'Bravo.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when doing any move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');
            tick(10);
            const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
            await componentTestUtils.expectMoveSuccess('#choosePiece_15', move, QuartoPartSlice.getInitialSlice());
            tick(10);

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
    });
    describe('DidacticialStep awaiting a click (deprecated)', () => {
        it('Should show success message after step success (one of several clics)', fakeAsync(async() => {
            // Given a DidacticialStep with several clics
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title',
                    'Click on (0, 0) or (3, 3)',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when doing that move
            await componentTestUtils.expectClickSuccess('#chooseCoord_0_0');

            // expect to see steps success message on component
            const expectedMessage: string = 'Bravo.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should show failure message after step failure (one of several clics)', fakeAsync(async() => {
            // Given a DidacticialStep with several clics
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title',
                    'Click on (0, 0) or (3, 3)',
                    QuartoPartSlice.getInitialSlice(),
                    ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when doing another move
            await componentTestUtils.expectClickSuccess('#chooseCoord_1_1');

            // expect to see steps success message on component
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('When unwanted click, and no move done, restart should not be needed', fakeAsync(async() => {
            // Given a DidacticialStep with possible invalid clicks
            const didacticial: DidacticialStep[] = [
                DidacticialStep.forClick(
                    'title 0',
                    'instruction 0.',
                    new QuartoPartSlice([
                        [0, 16, 16, 16],
                        [16, 16, 16, 16],
                        [16, 16, 16, 16],
                        [16, 16, 16, 16],
                    ], 0, QuartoPiece.ABBA),
                    ['#chooseCoord_3_3'],
                    'Bravo.',
                    'Perdu.',
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // When doing invalid click
            await componentTestUtils.expectClickFailure('#chooseCoord_0_0', 'Choisissez une case vide.');

            // expect to see cancelMove reason as message
            const expectedMessage: string = 'Perdu.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            const expectedReason: string = 'Choisissez une case vide.';
            const currentReason: string =
                componentTestUtils.findElement('#currentReason').nativeElement.innerHTML;
            expect(currentReason).toBe(expectedReason);
            // expect click to be still possible
            expect(componentTestUtils.getComponent().canUserPlay('#chooseCoord_0_0').isSuccess()).toBeTrue();
        }));
    });
    describe('Informational DidacticialStep', () => {
        it('Should forbid clicking on the board', fakeAsync(async() => {
            // Given a DidacticialStep on which nothing is awaited
            const didacticial: DidacticialStep[] = [
                DidacticialStep.informational(
                    'title 0',
                    'instruction 0',
                    QuartoPartSlice.getInitialSlice(),
                ),
            ];
            wrapper.startDidacticial(didacticial);

            // when clicking
            await componentTestUtils.expectClickForbidden('#chooseCoord_2_2');

            // expect to see still the steps success message on component
            const expectedMessage: string = 'instruction 0';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
        }));
        it('Should mark step as finished when skipped', fakeAsync(async() => {
            // Given a DidacticialStep with no action to do
            const didacticial: DidacticialStep[] = [
                DidacticialStep.informational(
                    'title',
                    'Explanation Explanation Explanation.',
                    QuartoPartSlice.getInitialSlice(),
                ),
                DidacticialStep.informational(
                    'title',
                    'Suite suite.',
                    QuartoPartSlice.getInitialSlice(),
                ),
            ];
            wrapper.startDidacticial(didacticial);
            // when clicking "Next Button"
            const nextButtonMessage: string =
                componentTestUtils.findElement('#nextButton').nativeElement.innerHTML;
            expect(nextButtonMessage).toBe('Continuer');
            expect(await componentTestUtils.clickElement('#nextButton')).toBeTrue();

            // expect to see next step on component
            const expectedMessage: string = 'Suite suite.';
            const currentMessage: string =
                componentTestUtils.findElement('#currentMessage').nativeElement.innerHTML;
            expect(currentMessage).toBe(expectedMessage);
            expect(wrapper.stepFinished[0]).toBeTrue();
        }));
    });
});
