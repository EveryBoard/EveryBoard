import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';

const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true }),
    getAuthenticatedUser: () => {
        return { pseudo: 'Pseudo', verified: true };
    },
};
describe('HeaderComponent', () => {
    let component: HeaderComponent;

    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [HeaderComponent],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
