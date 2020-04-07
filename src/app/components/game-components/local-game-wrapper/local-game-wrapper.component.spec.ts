import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalGameWrapperComponent } from './local-game-wrapper.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { UserService } from 'src/app/services/user/UserService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Quarto"
            },
        },
    },
}
const userServiceStub = {
    getActivesUsersObs: () => of([]),
};
const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),
    getAuthenticatedUser: () => { return { pseudo: 'Pseudo', verified: true}; },
};
describe('LocalGameWrapperComponent', () => {

    let component: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    beforeEach(async(() => {
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
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});