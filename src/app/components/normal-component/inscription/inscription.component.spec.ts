import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { InscriptionComponent } from './inscription.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AuthenticationServiceMock } from 'src/app/services/authentication/AuthenticationService.spec';

describe('InscriptionComponent', () => {
    let component: InscriptionComponent;

    let fixture: ComponentFixture<InscriptionComponent>;

    const clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = fixture.debugElement.query(By.css(elementName));
        if (element == null) {
            return null;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        }
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [InscriptionComponent],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(InscriptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('Registration should navigate to ConfirmInscriptionComponent', fakeAsync(async() => {
        spyOn(component.router, 'navigate');

        expect(await clickElement('#registerButton')).toBeTrue();

        expect(component.router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    }));
    it('Registration failure should show a message', fakeAsync(async() => {
        spyOn(component.router, 'navigate');
        spyOn(component.authService, 'doRegister').and.rejectWith({ message: 'c\'est caca monsieur.' });

        expect(await clickElement('#registerButton')).toBeTrue();

        const expectedError: string = fixture.debugElement.query(By.css('#errorMessage')).nativeElement.innerHTML;
        expect(component.router.navigate).not.toHaveBeenCalled();
        expect(expectedError).toBe('c\'est caca monsieur.');
    }));
});
