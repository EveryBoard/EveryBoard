import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';

const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true }),
    getAuthenticatedUser: () => {
        return { pseudo: 'Pseudo', verified: true };
    },
};
describe('LoginComponent', () => {
    let component: LoginComponent;

    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [LoginComponent],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
