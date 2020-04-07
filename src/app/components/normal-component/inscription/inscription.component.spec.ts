import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionComponent } from './inscription.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

const authenticationServiceStub = {
    getJoueurObs: () => of({ pseudo: 'Pseudo', verified: true}),
    getAuthenticatedUser: () => { return { pseudo: 'Pseudo', verified: true}; },
};
describe('InscriptionComponent', () => {

    let component: InscriptionComponent;

    let fixture: ComponentFixture<InscriptionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [InscriptionComponent],
            providers: [
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(InscriptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});