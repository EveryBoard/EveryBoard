import { fakeAsync, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { MGPValidation } from 'src/app/utils/MGPValidation';

describe('LoginComponent', () => {
    let testUtils: SimpleComponentTestUtils<LoginComponent>;

    let router: Router;

    let authenticationService: AuthenticationService;

    function findShownError(): string {
        return testUtils.findElement('#errorMessage').nativeElement.innerHTML;
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(LoginComponent);
        testUtils.detectChanges();
        router = TestBed.inject(Router);
        authenticationService = TestBed.inject(AuthenticationService);
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
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

        it('should redirect when email login succeeds', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given an existing user
            spyOn(authenticationService, 'doEmailLogin').and.resolveTo(MGPValidation.SUCCESS);

            // when the user logs in
            await login();

            // then email login has been performed and the user is redirected
            expect(authenticationService.doEmailLogin).toHaveBeenCalledWith(email, password);
            expect(router.navigate).toHaveBeenCalledWith(['/server']);
        }));
        it('should show an error if login fails', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given a user that will fail to login
            spyOn(authenticationService, 'doEmailLogin').and.resolveTo(MGPValidation.failure('Error message'));

            // when the user logs in
            await login();

            // then the error message is shown
            expect(findShownError()).toEqual('Error message');
            expect(router.navigate).not.toHaveBeenCalled();
        }));
    });
    describe('doGoogleLogin', () => {
        async function login(): Promise<void> {
            return testUtils.clickElement('#googleButton');
        }
        it('should redirect when email connection work', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given a google user

            // when the user logs in
            spyOn(authenticationService, 'doGoogleLogin').and.resolveTo(MGPValidation.SUCCESS);
            await login();

            // then google login has been performed and the user is redirected
            expect(authenticationService.doGoogleLogin).toHaveBeenCalledWith();
            expect(router.navigate).toHaveBeenCalledWith(['/server']);
        }));
        it('should show an error if login fails', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given a user that will fail to login
            spyOn(authenticationService, 'doGoogleLogin').and.resolveTo(MGPValidation.failure('Error message'));

            // when the user logs in
            await login();

            // then the error message is shown
            expect(findShownError()).toEqual('Error message');
            expect(router.navigate).not.toHaveBeenCalled();
        }));
    });
});
