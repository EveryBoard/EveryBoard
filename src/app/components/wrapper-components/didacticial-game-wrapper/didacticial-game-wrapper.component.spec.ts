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
fdescribe('DidacticialGameWrapperComponent', () => {
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
        const clickSpy: jasmine.Spy = spyOn(gameComponent, 'click').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            clickSpy,
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
        const expectations: MoveExpectations = {
            move: new QuartoMove(0, 0, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#choosePiece_15', testElements, expectations);

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
        const expectations: MoveExpectations = {
            move: new QuartoMove(1, 1, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#choosePiece_15', testElements, expectations);

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
    it('Should pass to next step after step end ("ok")', fakeAsync(async() => {
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

        // when clicking "Next Button"
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // expect to see next step on component
        const expectedMessage: string = 'Following Following Following.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should start step again after clicking "retry" on step failure', fakeAsync(async() => {
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
        await expectClickSuccess('#choosePiece_8', testElements);
        const expectations: MoveExpectations = {
            move: new QuartoMove(1, 1, QuartoPiece.BAAA),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#chooseCoord_1_1', testElements, expectations);
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
        const expectations: MoveExpectations = {
            move: new QuartoMove(0, 0, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null,
            scoreOne: null,
        };
        await expectMoveSuccess('#chooseCoord_0_0', testElements, expectations);
        expect(await clickElement('#retryButton', testElements)).toBeTrue();

        // expect to see steps instruction message on component and board restarted
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe('instruction');
        expect(component.gameComponent.rules.node.gamePartSlice).toEqual(QuartoPartSlice.getInitialSlice());
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
    it('Should allow step without move or click to do', fakeAsync(async() => {
        // Given a DidacticialStep with no action to do
        component.steps = [
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

        // when clicking "Next Button"
        expect(await clickElement('#nextButton', testElements)).toBeTrue();

        // expect to see next step on component
        const expectedMessage: string = 'Suite suite.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
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
        const expectations: MoveExpectations = {
            move: new QuartoMove(0, 0, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null, scoreOne: null,
        };
        await expectMoveSuccess('#choosePiece_15', testElements, expectations);

        // when clicking again
        await expectClickForbidden('#chooseCoord_2_2', testElements);

        // expect to see still the steps success message on component
        const expectedMessage: string = 'Bravo.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should forbid clicking on the board when step don\'t await anything', fakeAsync(async() => {
        // Given a DidacticialStep on which nothing is awaited
        component.steps = [
            new DidacticialStep(
                'title',
                'instruction',
                QuartoPartSlice.getInitialSlice(),
                [],
                [],
                'Bravo.',
                'Perdu.',
            ),
        ];
        // when clicking
        await expectClickForbidden('#chooseCoord_2_2', testElements);

        // expect to see still the steps success message on component
        const expectedMessage: string = 'instruction';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show congratulation at the end of the didacticial', fakeAsync(async() => {
        // Given a DidacticialStep whose last step has been done
        component.steps = [
            new DidacticialStep(
                'title',
                'Put your piece in a corner and give the opposite one.',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_0_0'],
                'Bravo.',
                'Perdu.',
            ),
        ];
        await expectClickSuccess('#chooseCoord_0_0', testElements);

        // when clicking next button
        await clickElement('#nextButton', testElements);

        // expect to see end tutorial congratulations
        const expectedMessage: string = component.COMPLETED_TUTORIAL_MESSAGE;
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show title of the steps', fakeAsync(async() => {
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
        const expectedTitle: string = '<span style="color: black;">title 2</span>';
        const currentTitle: string =
            testElements.debugElement.query(By.css('#step_2')).nativeElement.innerHTML;
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
    it('When invalid move is done, in addition to the toast, message should become the reason', fakeAsync(async() => {
        // Given a DidacticialStep with possible invalid clicks
        const didacticial: DidacticialStep[] = [
            new DidacticialStep(
                'title 0', 'instruction 0',
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

        // expect to see cancelMove reason as message
        const expectedMessage: string = 'Choisissez une case vide.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('cliquer sur "suivant" n\'apparait qu\'après avoir réussi, cliquer sur "passer" permet à tout moment de skipper sans réussite');
    it('Should not show button \'next\' on last step when no previous one is unfinished');
    it('Should propose to restart the whole didacticial when last step finished');
    it('Should move to the next unfinished step when next step is finished');
    it('Should move to the first unfinished step when all next steps are finished');
});
