import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GoComponent } from './go.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { UserService } from 'src/app/services/user/UserService';
import { ActivatedRoute } from '@angular/router';
import { AppModule, INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Go"
            },
        },
    },
}
const userServiceStub = {
    getActivesUsersObs: () => of([]),
};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: null, verified: null}),
    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('GoComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: GoComponent;

    beforeAll(() => {
        GoComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        tick(1);
        gameComponent = wrapper.gameComponent as GoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("GoComponent should be created");
    });
    it('should allow to pass twice, then use "pass" as the method to "accept"', () => {
        expect(gameComponent.pass()).toBeTruthy(0); // Passed
        expect(gameComponent.pass()).toBeTruthy(1); // Counting
        expect(gameComponent.pass()).toBeTruthy(2); // Accept

        expect(gameComponent.pass()).toBeTruthy(3); // Finished

        expect(gameComponent.pass()).toBeFalsy(4);
    });
});