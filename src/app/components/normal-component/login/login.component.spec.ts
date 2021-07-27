import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { By } from '@angular/platform-browser';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';

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
                'This password is incorrect');
            expectErrorToInduceMessage(
                'There is no user record corresponding to this identifier. The user may have been deleted.',
                `This email address has no account on this website`);
            expectErrorToInduceMessage(
                'Missing or insufficient permissions.',
                'You must click the confirmation link that you should have received by email.');
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
