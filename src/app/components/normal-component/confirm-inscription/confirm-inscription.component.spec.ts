import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmInscriptionComponent } from './confirm-inscription.component';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';

describe('ConfirmInscriptionComponent', () => {
    let component: ConfirmInscriptionComponent;

    let fixture: ComponentFixture<ConfirmInscriptionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ConfirmInscriptionComponent,
            ],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        AuthenticationServiceMock.setUser(AuthenticationServiceMock.CONNECTED);
        fixture = TestBed.createComponent(ConfirmInscriptionComponent);
        component = fixture.componentInstance;
    });
    it('should create and send notification', () => {
        spyOn(component.authService, 'sendEmailVerification');
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(component.authService.sendEmailVerification).toHaveBeenCalled();
    });
});
