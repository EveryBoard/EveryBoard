import { fakeAsync, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Observable, ReplaySubject } from 'rxjs';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';

describe('LoginComponent', () => {
    let testUtils: SimpleComponentTestUtils<LoginComponent>;

    let router: Router;

    let authenticationService: AuthenticationService;

    let userRS: ReplaySubject<AuthUser>;

    function getShownError(): string {
        return testUtils.findElement('#errorMessage').nativeElement.innerHTML;
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LoginComponent);
        router = TestBed.inject(Router);
        authenticationService = TestBed.inject(AuthenticationService);

        userRS = new ReplaySubject<AuthUser>(1);
        const userObs: Observable<AuthUser> = userRS.asObservable();
        spyOn(authenticationService, 'getUserObs').and.returnValue(userObs);

        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    describe('redirections', () => {
        it('should redirect upon logged-in user change', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given an existing user
            const user: AuthUser = AuthenticationServiceMock.CONNECTED;

            // when the user gets connected
            userRS.next(user);
            testUtils.detectChanges();

            // then a redirection happens
            expect(router.navigate).toHaveBeenCalledWith(['/server']);
        }));
        it('should not redirect if it sees a non logged-in user', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given that no user is connected
            const user: AuthUser = AuthUser.NOT_CONNECTED;

            // when a non-connected visitor visits this component
            userRS.next(user);
            testUtils.detectChanges();

            // then there is no redirection
            expect(router.navigate).not.toHaveBeenCalled();
        }));
    });
    describe('doEmailLogin', () => {
        const email: string = 'jean@jaja.europe';
        const password: string = 'hunter2';
        async function login(): Promise<void> {
            testUtils.fillInput('#email', email);
            testUtils.fillInput('#password', password);
            await testUtils.clickElement('#loginButton');
            testUtils.detectChanges();
        }

        it('should dispatch email login to authentication service', fakeAsync(async() => {
            // given an existing user
            spyOn(authenticationService, 'doEmailLogin').and.resolveTo(MGPValidation.SUCCESS);

            // when the user logs in
            await login();

            // then email login has been performed
            expect(authenticationService.doEmailLogin).toHaveBeenCalledWith(email, password);
        }));
        it('should show an error if login fails', fakeAsync(async() => {
            // given a user that will fail to login
            spyOn(authenticationService, 'doEmailLogin').and.resolveTo(MGPValidation.failure('Error message'));

            // when the user logs in
            await login();

            // then the error message is shown
            expect(getShownError()).toEqual('Error message');
        }));
    });
    describe('doGoogleLogin', () => {
        async function login(): Promise<void> {
            return testUtils.clickElement('#googleButton');
        }
        it('should dispatch google login to authentication service', fakeAsync(async() => {
            // given a google user
            spyOn(authenticationService, 'doGoogleLogin').and.resolveTo(MGPValidation.SUCCESS);

            // when the user logs in
            await login();

            // then google login has been performed
            expect(authenticationService.doGoogleLogin).toHaveBeenCalledWith();
        }));
        it('should show an error if login fails', fakeAsync(async() => {
            // given a user that will fail to login
            spyOn(authenticationService, 'doGoogleLogin').and.resolveTo(MGPValidation.failure('Error message'));

            // when the user logs in
            await login();

            // then the error message is shown
            expect(getShownError()).toEqual('Error message');
        }));
    });
});
