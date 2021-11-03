import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RegisterComponent } from './register.component';
import firebase from 'firebase/app';

describe('RegisterComponent', () => {
    let testUtils: SimpleComponentTestUtils<RegisterComponent>;

    let router: Router;

    let authService: AuthenticationService;

    const username: string = 'jeanjaja';
    const email: string = 'jean@jaja.europe';
    const password: string = 'hunter2';
    const user: firebase.User = { displayName: 'jeanjaja', email: 'jean@jaja.europe' } as firebase.User;

    function fillInUserDetails() {
        testUtils.fillInput('#email', email);
        testUtils.fillInput('#username', username);
        testUtils.fillInput('#password', password);
        testUtils.detectChanges();
    }

    function getShownError(): string {
        testUtils.expectElementToExist('#errorMessage');
        return testUtils.findElement('#errorMessage').nativeElement.innerHTML;
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(RegisterComponent);
        testUtils.detectChanges();
        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthenticationService);
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should register, send email verification, and navigate to verification page upon success', fakeAsync(async() => {
        spyOn(router, 'navigate');
        spyOn(authService, 'doRegister').and.resolveTo(MGPFallible.success(user));
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);

        // given some user
        fillInUserDetails();

        // when the user clicks on the registration button
        await testUtils.clickElement('#registerButton');

        // then the services are called and the user is registered
        expect(router.navigate).toHaveBeenCalledWith(['/verify-account']);
        expect(authService.sendEmailVerification).toHaveBeenCalledWith();
        expect(authService.doRegister).toHaveBeenCalledWith(username, email, password);
    }));
    it('should show a message upon registration failure', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        // given some user
        fillInUserDetails();

        // when the user registers and it fails
        const error: string = `c'est caca monsieur.`;
        spyOn(authService, 'doRegister').and.resolveTo(MGPFallible.failure(error));
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);
        await testUtils.clickElement('#registerButton');

        // then an error message is shown
        expect(getShownError()).toBe(error);
        expect(router.navigate).not.toHaveBeenCalled();
    }));
    it('should show a message if verification email fails to be sent', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        // given some user
        fillInUserDetails();

        // when the user registers and it fails
        const error: string = `c'est caca monsieur.`;
        spyOn(authService, 'doRegister').and.resolveTo(MGPFallible.success(user));
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.failure(error));
        await testUtils.clickElement('#registerButton');
        testUtils.detectChanges();

        // then an error message is shown
        expect(getShownError()).toBe(error);
        expect(router.navigate).not.toHaveBeenCalled();
    }));
    it('should dynamically validate password', fakeAsync(async() => {
        // given some user
        // when it fills in a password that is too short
        testUtils.fillInput('#password', '123');
        testUtils.detectChanges();

        // then the help indicator is colored red
        testUtils.expectElementToHaveClass('#passwordHelp', 'is-danger');
    }));
    describe('google registration', () => {
        it('should delegate registration with google to auth service', fakeAsync(async() => {
            // given a google user
            spyOn(authService, 'doGoogleLogin').and.resolveTo(MGPValidation.SUCCESS);
            // when that persons registers on the website with google
            await testUtils.clickElement('#googleButton');
            // then the corresponding service method is called
            expect(authService.doGoogleLogin).toHaveBeenCalledWith();
        }));
        it('should show an error if registration fails', fakeAsync(async() => {
            // given a user that will fail to register
            spyOn(authService, 'doGoogleLogin').and.resolveTo(MGPValidation.failure('Error message'));
            // when he user registers
            await testUtils.clickElement('#googleButton');
            // then the error message is shown
            expect(getShownError()).toEqual('Error message');
        }));
    });
});
