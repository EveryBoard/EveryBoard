import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { UserService } from 'src/app/services/user/UserService';
import { By } from '@angular/platform-browser';
import { DidacticialGameWrapperComponent } from './didacticial-game-wrapper.component';
import {
    clickElement, expectClickFail, expectClickForbidden, expectClickSuccess,
    expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { DidacticialStep } from './DidacticialStep';
import { QuartoComponent } from '../../game-components/quarto/quarto.component';
import { QuartoMove } from 'src/app/games/quarto/quarto-move/QuartoMove';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { QuartoPiece } from 'src/app/games/quarto/QuartoPiece';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Quarto';
            },
        },
    },
};
class AuthenticationServiceMock {
    public static USER: { pseudo: string, verified: boolean } = { pseudo: null, verified: null };

    public getJoueurObs(): Observable<{ pseudo: string, verified: boolean }> {
        return of(AuthenticationServiceMock.USER);
    }
    public getAuthenticatedUser(): { pseudo: string, verified: boolean } {
        return AuthenticationServiceMock.USER;
    }
}
describe('DidacticialGameWrapperComponent', () => {
    let component: DidacticialGameWrapperComponent;

    let testElements: TestElements;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
                { provide: UserService, useValue: {} },
            ],
        }).compileComponents();
        const fixture: ComponentFixture<DidacticialGameWrapperComponent> =
            TestBed.createComponent(DidacticialGameWrapperComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement;
        tick(1);
        const gameComponent: QuartoComponent = component.gameComponent as QuartoComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onValidUserMoveSpy: jasmine.Spy = spyOn(component, 'onValidUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onValidUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(component).toBeTruthy();
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
            new DidacticialStep(
                'title',
                'instruction',
                slice,
                [],
                ['#click_0_0'],
                'Bravo.',
                'Perdu.',
            ),
        ];
        // when starting didacticial
        component.startDidacticial(didacticial);

        // expect to see step instruction on component
        const expectedMessage: string = 'instruction';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        const actualSlice: QuartoPartSlice = component.gameComponent.rules.node.gamePartSlice as QuartoPartSlice;
        expect(actualSlice).toEqual(slice);
    }));
    it('Should show title of the steps, the selected one in bold', fakeAsync(async() => {
        // Given a DidacticialStep with 3 steps
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0', 'instruction',
                QuartoPartSlice.getInitialSlice(),
                [], [], 'Bravo.', 'Perdu.',
            ),
            new DidacticialStep(
                'title 1', 'instruction',
                QuartoPartSlice.getInitialSlice(),
                [], [], 'Bravo.', 'Perdu.',
            ),
            new DidacticialStep(
                'title 2', 'instruction',
                QuartoPartSlice.getInitialSlice(),
                [], [], 'Bravo.', 'Perdu.',
            ),
        ];
        // when page rendered
        component.startDidacticial(didacticial);

        // expect to see three "li" with step title
        let expectedTitle: string = '<span style="color: black;"><b>title 0</b></span>';
        let currentTitle: string =
            testElements.debugElement.query(By.css('#step_0')).nativeElement.innerHTML;
        expect(currentTitle).toBe(expectedTitle);
        expectedTitle = '<span style="color: black;">title 1</span>';
        currentTitle =
            testElements.debugElement.query(By.css('#step_1')).nativeElement.innerHTML;
        expect(currentTitle).toBe(expectedTitle);
    }));
    it('Should go to specific step when clicking on it', fakeAsync(async() => {
        // Given a DidacticialStep with 3 steps
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0', 'instruction 0',
                QuartoPartSlice.getInitialSlice(),
                [], [], 'Bravo.', 'Perdu.',
            ),
            new DidacticialStep(
                'title 1', 'instruction 1',
                QuartoPartSlice.getInitialSlice(),
                [], [], 'Bravo.', 'Perdu.',
            ),
            new DidacticialStep(
                'title 2', 'instruction 2',
                QuartoPartSlice.getInitialSlice(),
                [], [], 'Bravo.', 'Perdu.',
            ),
        ];
        component.startDidacticial(didacticial);

        // when clicking on step 2
        expect(await clickElement('#step_2', testElements)).toBeTruthy();

        // expect to have the step 2 shown
        const expectedMessage: string = 'instruction 2';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show highlight of first click when awaiting a move on multiclick game component', fakeAsync(async() => {
        // Given a DidacticialStep with several moves
        component.steps = [
            new DidacticialStep(
                'title',
                'Put your piece in a corner and give the opposite one.',
                QuartoPartSlice.getInitialSlice(),
                [
                    new QuartoMove(0, 0, QuartoPiece.BBBB),
                    new QuartoMove(0, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 0, QuartoPiece.BBBB),
                ],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];
        // when doing that move
        await expectClickSuccess('#chooseCoord_3_3', testElements);
        tick(11);

        // expect highlight to be present
        const element: DebugElement = testElements.debugElement.query(By.css('#highlight'));
        expect(element).toBeTruthy('Highlight should be present');
    }));
    it('Should show success message after step success (one of several moves)', fakeAsync(async() => {
        // Given a DidacticialStep with several moves
        component.steps = [
            new DidacticialStep(
                'title',
                'Put your piece in a corner and give the opposite one.',
                QuartoPartSlice.getInitialSlice(),
                [
                    new QuartoMove(0, 0, QuartoPiece.BBBB),
                    new QuartoMove(0, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 0, QuartoPiece.BBBB),
                ],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];
        // when doing that move
        await expectClickSuccess('#chooseCoord_0_0', testElements);
        tick(10);
        const expectations: MoveExpectations = {
            move: new QuartoMove(0, 0, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#choosePiece_15', testElements, expectations);
        tick(10);

        // expect to see steps success message on component
        const expectedMessage: string = 'Bravo.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show failure message after step failure (one of several moves)', fakeAsync(async() => {
        // Given a DidacticialStep with several move
        component.steps = [
            new DidacticialStep(
                'title',
                'Put your piece in a corner and give the opposite one.',
                QuartoPartSlice.getInitialSlice(),
                [
                    new QuartoMove(0, 0, QuartoPiece.BBBB),
                    new QuartoMove(0, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 0, QuartoPiece.BBBB),
                ],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];

        // when doing another move
        await expectClickSuccess('#chooseCoord_1_1', testElements);
        tick(10);
        const expectations: MoveExpectations = {
            move: new QuartoMove(1, 1, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#choosePiece_15', testElements, expectations);
        tick(10);

        // expect to see steps success message on component
        const expectedMessage: string = 'Perdu.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show success message after step success (one of several clics)', fakeAsync(async() => {
        // Given a DidacticialStep with several clics
        component.steps = [
            new DidacticialStep(
                'title',
                'Click on (0, 0) or (3, 3)',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                'Bravo.',
                'Perdu.',
            ),
        ];

        // when doing that move
        await expectClickSuccess('#chooseCoord_0_0', testElements);

        // expect to see steps success message on component
        const expectedMessage: string = 'Bravo.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show failure message after step failure (one of several clics)', fakeAsync(async() => {
        // Given a DidacticialStep with several clics
        component.steps = [
            new DidacticialStep(
                'title',
                'Click on (0, 0) or (3, 3)',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0', '#chooseCoord_3_3'],
                'Bravo.',
                'Perdu.',
            ),
        ];

        // when doing another move
        await expectClickSuccess('#chooseCoord_1_1', testElements);

        // expect to see steps success message on component
        const expectedMessage: string = 'Perdu.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should forbid clicking on the board when step don\'t await anything', fakeAsync(async() => {
        // Given a DidacticialStep on which nothing is awaited
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0',
                'instruction 0',
                QuartoPartSlice.getInitialSlice(),
                [], [], null, null,
            ),
        ];
        component.startDidacticial(didacticial);
        // when clicking
        await expectClickForbidden('#chooseCoord_2_2', testElements);

        // expect to see still the steps success message on component
        const expectedMessage: string = 'instruction 0';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('When unwanted move is done, toast message should be shown and restart needed', fakeAsync(async() => {
        // Given a DidacticialStep with possible invalid clicks
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0', 'instruction 0.',
                new QuartoPartSlice([
                    [0, 16, 16, 16],
                    [16, 16, 16, 16],
                    [16, 16, 16, 16],
                    [16, 16, 16, 16],
                ], 0, QuartoPiece.ABBA),
                [new QuartoMove(3, 3, QuartoPiece.BBBB)],
                [], 'Bravo.', 'Perdu.',
            ),
        ];
        component.startDidacticial(didacticial);

        // When doing invalid click
        await expectClickFail('#chooseCoord_0_0', testElements, 'Choisissez une case vide.');
        tick(10);

        // expect to see cancelMove reason as message
        const expectedMessage: string = 'instruction 0.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        const expectedReason: string = 'Choisissez une case vide.';
        const currentReason: string =
            testElements.debugElement.query(By.css('#currentReason')).nativeElement.innerHTML;
        expect(currentReason).toBe(expectedReason);
    }));
    it('When unwanted click, and no move done, restart should not be needed', fakeAsync(async() => {
        // Given a DidacticialStep with possible invalid clicks
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0', 'instruction 0.',
                new QuartoPartSlice([
                    [0, 16, 16, 16],
                    [16, 16, 16, 16],
                    [16, 16, 16, 16],
                    [16, 16, 16, 16],
                ], 0, QuartoPiece.ABBA),
                [],
                ['#chooseCoord_3_3'],
                'Bravo.', 'Perdu.',
            ),
        ];
        component.startDidacticial(didacticial);

        // When doing invalid click
        await expectClickFail('#chooseCoord_0_0', testElements, 'Choisissez une case vide.');

        // expect to see cancelMove reason as message
        const expectedMessage: string = 'Perdu.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        const expectedReason: string = 'Choisissez une case vide.';
        const currentReason: string =
            testElements.debugElement.query(By.css('#currentReason')).nativeElement.innerHTML;
        expect(currentReason).toBe(expectedReason);
        expect(testElements.gameComponent.canUserPlay('#chooseCoord_0_0').isSuccess()).toBeTrue();
    }));
    // ///////////////////// Retry ///////////////////////////////////////////////////////////////////
    it('Should start step again after clicking "retry" on step failure', fakeAsync(async() => {
        // Given any DidacticialStep where an invalid move has been done
        component.steps = [
            new DidacticialStep(
                'title',
                'instruction',
                QuartoPartSlice.getInitialSlice(),
                [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];
        await expectClickSuccess('#choosePiece_8', testElements);
        tick(10);
        const expectations: MoveExpectations = {
            move: new QuartoMove(1, 1, QuartoPiece.BAAA),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#chooseCoord_1_1', testElements, expectations);
        tick(10);

        // when clicking retry
        expect(await clickElement('#retryButton', testElements)).toBeTrue();

        // expect to see steps instruction message on component and board restarted
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe('instruction');
        expect(component.gameComponent.rules.node.gamePartSlice).toEqual(QuartoPartSlice.getInitialSlice());
    }));
    it('Should start step again after clicking "retry" on step success', fakeAsync(async() => {
        // Given any DidacticialStep
        component.steps = [
            new DidacticialStep(
                'title',
                'instruction',
                QuartoPartSlice.getInitialSlice(),
                [new QuartoMove(0, 0, QuartoPiece.BBBB)],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];
        // when doing another move, then clicking retry
        await expectClickSuccess('#choosePiece_15', testElements);
        tick(10);
        const expectations: MoveExpectations = {
            move: new QuartoMove(0, 0, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#chooseCoord_0_0', testElements, expectations);
        tick(10);
        expect(await clickElement('#retryButton', testElements)).toBeTrue();

        // expect to see steps instruction message on component and board restarted
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe('instruction');
        expect(component.gameComponent.rules.node.gamePartSlice).toEqual(QuartoPartSlice.getInitialSlice());
    }));
    it('Should forbid clicking again on the board after success', fakeAsync(async() => {
        // Given a DidacticialStep on which a valid move has been done.
        component.steps = [
            new DidacticialStep(
                'title',
                'Put your piece in a corner and give the opposite one.',
                QuartoPartSlice.getInitialSlice(),
                [
                    new QuartoMove(0, 0, QuartoPiece.BBBB),
                    new QuartoMove(0, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 3, QuartoPiece.BBBB),
                    new QuartoMove(3, 0, QuartoPiece.BBBB),
                ],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];
        await expectClickSuccess('#chooseCoord_0_0', testElements);
        tick(10);
        const expectations: MoveExpectations = {
            move: new QuartoMove(0, 0, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#choosePiece_15', testElements, expectations);
        tick(10);

        // when clicking again
        await expectClickForbidden('#chooseCoord_2_2', testElements);
        tick(10);

        // expect to see still the steps success message on component
        const expectedMessage: string = 'Bravo.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should allow clicking again after restarting succeeded steps', fakeAsync(async() => {
        // Given any DidacticialStep whose step has been succeeded and restarted
        component.steps = [
            new DidacticialStep(
                'title',
                'instruction',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#choosePiece_15'],
                'Bravo.',
                'Perdu.',
            ),
        ];
        await expectClickSuccess('#choosePiece_15', testElements);
        expect(await clickElement('#retryButton', testElements)).toEqual(true, 'Retry button should exist');

        // When trying again
        await expectClickSuccess('#choosePiece_15', testElements);

        // expect to see success message again
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe('Bravo.');
        expect(component.gameComponent.rules.node.gamePartSlice).toEqual(QuartoPartSlice.getInitialSlice());
    }));
    // /////////////////////// Next /////////////////////////////////////////////////////////
    it('Should allow to skip step', fakeAsync(async() => {
        // Given a DidacticialStep with one clic
        component.steps = [
            new DidacticialStep(
                'title',
                'Explanation Explanation Explanation.',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['chooseCoord_0_0'],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'title',
                'Following Following Following.',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0'],
                'Fini.',
                'Reperdu.',
            ),
        ];
        // when clicking "Skip"
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // expect to see next step on component
        const expectedMessage: string = 'Following Following Following.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        expect(component.stepFinished[0]).toBeFalse();
    }));
    it('Should mark "infos-step" as finished when skipped', fakeAsync(async() => {
        // Given a DidacticialStep with no action to do
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title',
                'Explanation Explanation Explanation.',
                QuartoPartSlice.getInitialSlice(),
                [],
                [],
                null,
                null,
            ),
            new DidacticialStep(
                'title',
                'Suite suite.',
                QuartoPartSlice.getInitialSlice(),
                [],
                [],
                null,
                null,
            ),
        ];
        component.startDidacticial(didacticial);
        // when clicking "Next Button"
        const nextButtonMessage: string =
            testElements.debugElement.query(By.css('#nextButton')).nativeElement.innerHTML;
        expect(nextButtonMessage).toBe('Continuer');
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // expect to see next step on component
        const expectedMessage: string = 'Suite suite.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        expect(component.stepFinished[0]).toBeTrue();
    }));
    it('Should move to the next unfinished step when next step is finished', fakeAsync(async() => {
        // Given a didacticial on which the two first steps have been skipped
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0',
                'instruction 0',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0'],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'title 1',
                'instruction 1',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_1_1'],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'title 2',
                'instruction 2',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_2_2'],
                'Bravo.',
                'Perdu.',
            ),
        ];
        component.startDidacticial(didacticial);
        expect(await clickElement('#nextButton', testElements)).toBeTrue();
        expect(await clickElement('#nextButton', testElements)).toBeTrue();
        await expectClickSuccess('#chooseCoord_2_2', testElements);

        // When clicking next
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // expect to be back at first step
        const expectedMessage: string = 'instruction 0';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should move to the first unfinished step when all next steps are finished', fakeAsync(async() => {
        // Given a didacticial on which the middle steps have been skipped
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0',
                'instruction 0',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0'],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'title 1',
                'instruction 1',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_1_1'],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'title 2',
                'instruction 2',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_2_2'],
                'Bravo.',
                'Perdu.',
            ),
        ];
        component.startDidacticial(didacticial);
        expect(await clickElement('#nextButton', testElements)).toBeTrue(); // Go to 1
        await expectClickSuccess('#chooseCoord_1_1', testElements); // Do 1
        expect(await clickElement('#nextButton', testElements)).toBeTrue(); // Go to 2
        expect(await clickElement('#nextButton', testElements)).toBeTrue(); // Go to 0

        // When clicking next
        expect(await clickElement('#nextButton', testElements)).toBeTrue(); // Should go to 2

        // expect to be back at first step
        const expectedMessage: string = 'instruction 2';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show congratulation at the end of the didacticial, hide next button', fakeAsync(async() => {
        // Given a DidacticialStep whose last step has been done
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0',
                'instruction 0',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0'],
                'Bravo.',
                'Perdu.',
            ),
        ];
        component.startDidacticial(didacticial);
        await expectClickSuccess('#chooseCoord_0_0', testElements);

        // when clicking next button
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // expect to see end tutorial congratulations
        const expectedMessage: string = component.COMPLETED_TUTORIAL_MESSAGE;
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        // expect next button to be hidden
        expect(await clickElement('#nextButton', testElements)).toBeNull();
        // expect retry button to be hidden
        expect(await clickElement('#retryButton', testElements)).toBeNull();
        // expect restart button to be here
        expect(await clickElement('#restartButton', testElements)).toBeTrue();
    }));
    it('Should allow to restart the whole didacticial when finished', fakeAsync(async() => {
        // Given a finish tutorial
        component.startDidacticial([
            new DidacticialStep(
                'title 0',
                'instruction 0',
                QuartoPartSlice.getInitialSlice(),
                [],
                [],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'title 1',
                'instruction 1',
                QuartoPartSlice.getInitialSlice(),
                [],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ]);
        expect(await clickElement('#nextButton', testElements)).toBeTrue();
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // when clicking restart
        expect(await clickElement('#restartButton', testElements)).toBeTrue();
        testElements.fixture.detectChanges();

        // expect to be back on first step
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(component.steps[0].instruction);
        expect(component.stepFinished.every((v: boolean) => v === false)).toBeTrue();
        expect(component.stepIndex).toEqual(0);
    }));
});
