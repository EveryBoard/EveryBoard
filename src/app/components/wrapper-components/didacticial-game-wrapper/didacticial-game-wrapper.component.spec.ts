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
import { expectClickSuccess, TestElements } from 'src/app/utils/TestUtils';
import { AwaleComponent } from '../../game-components/awale/awale.component';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Awale';
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
        const gameComponent: AwaleComponent = component.gameComponent as AwaleComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onValidUserMoveSpy: jasmine.Spy = spyOn(component, 'onValidUserMove').and.callThrough();
        testElements = { fixture, debugElement, gameComponent, cancelMoveSpy, chooseMoveSpy, onValidUserMoveSpy };
    }));
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('Should show instruction bellow/beside the board', fakeAsync(async() => {
        const expectedMessage: string = component.steps[0].instruction;
        const currentMessage: string = debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    }));
    it('Should show success message after step success (unique move)', () => {
        // given a DidacticialStep with one move

        // when doing that move
        expectClickSuccess('click_0_0', )

        // expect to see message
        const expectedMessage: string = component.steps[0].failureMessage;
        const currentMessage: string = debugElement.query(By.css('#currentMessage')).nativeElement.innerHTML;
        expect(currentMessage).toBe(expectedMessage);
    });
    it('Should show success message after step success (one of several moves)');
    it('Should show success message after step success (clic)');
    it('Should pass to next step after step end ("ok")');
    it('Should show fail message after step failure');
    it('Should start step again after clicking "retry" on step failure');
});
