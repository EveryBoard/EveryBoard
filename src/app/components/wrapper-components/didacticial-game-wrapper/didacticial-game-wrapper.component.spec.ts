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
import { clickElement, expectClickSuccess, expectMoveSuccess, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
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
    it('Should show instruction bellow/beside the board', fakeAsync(async() => {
        const expectedMessage: string = component.steps[0].instruction;
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show success message after step success (one of several moves)', fakeAsync(async() => {
        // Given a DidacticialStep with several moves
        component.steps = [
            new DidacticialStep(
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
        testElements.clickSpy.calls.reset();
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
        testElements.clickSpy.calls.reset();
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
        // Given a DidacticialStep with one move
        component.steps = [
            new DidacticialStep(
                'Explanation Explanation Explanation.',
                QuartoPartSlice.getInitialSlice(),
                [],
                [],
                'Bravo.',
                'Perdu.',
            ),
            new DidacticialStep(
                'Following Following Following.',
                QuartoPartSlice.getInitialSlice(),
                [],
                ['#chooseCoord_8'],
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
                'click 0 0 and give the exact opposite piece to the one on the board.',
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
            move: new QuartoMove(1, 1, QuartoPiece.BBBB),
            slice: QuartoPartSlice.getInitialSlice(),
            scoreZero: null,
            scoreOne: null,
        };
        testElements.clickSpy.calls.reset();
        await expectMoveSuccess('#chooseCoord_1_1', testElements, expectations);
        expect(await clickElement('#retryButton', testElements)).toBeTrue();

        // expect to see steps instruction message on component and board restarted
        const expectedMessage: string = 'click 0 0 and give the exact opposite piece to the one on the board.';
        const currentMessage: string =
            testElements.debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
        expect(component.gameComponent.rules.node.gamePartSlice).toEqual(QuartoPartSlice.getInitialSlice());
    }));
    it('Should allow click less step!');
    it('Should not allow to click again on the board after success');
    it('Should do the thing that it does when the thing is finished');
    it('Should show title of the learning steps and make them clickage to go to next step');
    it('Should show title of the learning steps');
    it('If cancelMove has been called, it must be the automatic message of didacticial');
});
