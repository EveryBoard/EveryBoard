import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInscriptionComponent } from './confirm-inscription.component';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';

const authenticationServiceStub = {
    getAuthenticatedUser: () => {
        return { pseudo: 'Pseudo', verified: false };
    },
    sendEmailVerification: () => {
        return;
    },
};
describe('ConfirmInscriptionComponent', () => {
    let component: ConfirmInscriptionComponent;

    let fixture: ComponentFixture<ConfirmInscriptionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ConfirmInscriptionComponent,
            ],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ConfirmInscriptionComponent);
        component = fixture.componentInstance;
    });
    it('should create and send notification', () => {
        spyOn(component.authService, 'sendEmailVerification').and.callFake(async() => {});
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.authService.sendEmailVerification).toHaveBeenCalled();
    });
});
