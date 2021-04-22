import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { InscriptionComponent } from './inscription.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { Observable, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

class RouterMock {
    public async navigate(to: string[]): Promise<boolean> {
        return true;
    }
}
class AuthenticationServiceMock {
    public static CURRENT_USER: {pseudo: string, verified: boolean} = null;

    public static IS_USER_LOGGED: boolean = null;

    public getJoueurObs(): Observable<{pseudo: string, verified: boolean}> {
        if (AuthenticationServiceMock.CURRENT_USER == null) {
            throw new Error('MOCK VALUE CURRENT_USER NOT SET BEFORE USE');
        }
        return of(AuthenticationServiceMock.CURRENT_USER);
    }
    public async doRegister(): Promise<void> {
        return;
    }
}
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
                { provide: Router, useClass: RouterMock },
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
        spyOn(component.router, 'navigate').and.callThrough();

        expect(await clickElement('#registerButton')).toBeTrue();

        expect(component.router.navigate).toHaveBeenCalledWith(['/confirm-inscription']);
    }));
    it('Registration failure should show a message', fakeAsync(async() => {
        spyOn(component.router, 'navigate').and.callThrough();
        spyOn(component.authService, 'doRegister').and.rejectWith({ message: 'c\'est caca monsieur.' });

        expect(await clickElement('#registerButton')).toBeTrue();

        const expectedError: string = fixture.debugElement.query(By.css('#errorMessage')).nativeElement.innerHTML;
        expect(component.router.navigate).not.toHaveBeenCalled();
        expect(expectedError).toBe('c\'est caca monsieur.');
    }));
});
