import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';

class AuthenticationServiceMock {
    public static CURRENT_USER: {pseudo: string, verified: boolean} = null;

    public static IS_USER_LOGGED: boolean = null;

    public getJoueurObs(): Observable<{pseudo: string, verified: boolean}> {
        if (AuthenticationServiceMock.CURRENT_USER == null) {
            throw new Error('MOCK VALUE CURRENT_USER NOT SET BEFORE USE');
        }
        return of(AuthenticationServiceMock.CURRENT_USER);
    }
    public isUserLogged(): boolean {
        if (AuthenticationServiceMock.IS_USER_LOGGED == null) {
            throw new Error('MOCK IS_USER_LOGGED VALUE NOT SET BEFORE USE');
        } else {
            return AuthenticationServiceMock.IS_USER_LOGGED;
        }
    }
    public doEmailLogin(): Promise<unknown> {
        return;
    }
    public doGoogleLogin(): Promise<unknown> {
        return;
    }
}
describe('LoginComponent', () => {
    let component: LoginComponent;

    let fixture: ComponentFixture<LoginComponent>;

    let emailLoginSpy: jasmine.Spy;

    let googleLoginSpy: jasmine.Spy;

    const expectErrorToInduceMessage: (error: string, message: string) => Promise<void> =
    async(error: string, message: string) => {
        const promise: Promise<void> = new Promise((resolve: () => void, reject: (error: Error) => void) => {
            reject(new Error(error));
        });
        emailLoginSpy.and.returnValue(promise);
        component.loginWithEmail({ email: 'mgp@board.eu', password: '123' });
        tick();
        fixture.detectChanges();
        const expectedError: string = fixture.debugElement.query(By.css('#errorSpan')).nativeElement.innerHTML;
        expect(expectedError).toBe(message);
        return;
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            declarations: [LoginComponent],
            providers: [
                { provide: AuthenticationService, useClass: AuthenticationServiceMock },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        emailLoginSpy = spyOn(component.authenticationService, 'doEmailLogin');
        googleLoginSpy = spyOn(component.authenticationService, 'doGoogleLogin');
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('doEmailLogin', () => {
        it('should redirect when email connection work', fakeAsync(async() => {
            spyOn(component.router, 'navigate').and.callFake(async() => true);
            const promise: Promise<void> = new Promise((resolve: () => void) => {
                resolve();
            });
            emailLoginSpy.and.returnValue(promise);
            component.loginWithEmail({ email: 'mgp@board.eu', password: '123' });
            tick();
            fixture.detectChanges();
            expect(component.router.navigate).toHaveBeenCalledWith(['/server']);
        }));
        it('should map error message nicely', fakeAsync(async() => {
            expectErrorToInduceMessage(
                'The password is invalid or the user does not have a password.',
                'Ce mot de passe est incorrect');
            expectErrorToInduceMessage(
                'There is no user record corresponding to this identifier. The user may have been deleted.',
                'Cette adresse email n\'as pas de compte sur ce site.');
            expectErrorToInduceMessage(
                'Missing or insufficient permissions.',
                'Vous devez aller dans vos mail confirmer votre inscription en cliquant sur le lien que nous vous avons envoyé d\'abord.');
            expectErrorToInduceMessage(
                'Anything else will just be written, our job is to make that more user-friendly.',
                'Anything else will just be written, our job is to make that more user-friendly.');
        }));
    });
    describe('doGoogleLogin', () => {
        it('should redirect when email connection work', fakeAsync(async() => {
            spyOn(component.router, 'navigate').and.callFake(async() => true);
            const promise: Promise<void> = new Promise((resolve: () => void) => {
                resolve();
            });
            googleLoginSpy.and.returnValue(promise);
            component.loginWithGoogle();
            tick();
            fixture.detectChanges();
            expect(component.router.navigate).toHaveBeenCalledWith(['/server']);
        }));
        it('should map error message nicely', fakeAsync(async() => {
            const promise: Promise<void> = new Promise((resolve: () => void, reject: (error: Error) => void) => {
                reject(new Error('whatever.'));
            });
            googleLoginSpy.and.returnValue(promise);
            component.loginWithGoogle();
            tick();
            fixture.detectChanges();
            const expectedError: string = fixture.debugElement.query(By.css('#errorSpan')).nativeElement.innerHTML;
            expect(expectedError).toBe('whatever.');
        }));
    });
});
