import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInscriptionComponent } from './confirm-inscription.component';
import { AuthenticationService } from 'src/app/services/authentication-service/AuthenticationService';

const authenticationServiceStub = {
    getAuthenticatedUser: () => { return { pseudo: 'Pseudo', verified: false}; },
    sendEmailVerification: () => { return },
};
describe('ConfirmInscriptionComponent', () => {

    let component: ConfirmInscriptionComponent;

    let fixture: ComponentFixture<ConfirmInscriptionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ConfirmInscriptionComponent
            ],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub},
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmInscriptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});