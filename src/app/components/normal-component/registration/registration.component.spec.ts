import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RegistrationComponent } from './registration.component';
import firebase from 'firebase/app';

describe('RegistrationComponent', () => {
    let testUtils: SimpleComponentTestUtils<RegistrationComponent>;

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

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(RegistrationComponent);
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
        spyOn(authService, 'doRegister').and.resolveTo(MGPFallible.failure(`c'est caca monsieur.` ));
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);
        await testUtils.clickElement('#registerButton');

        // then an error message is shown
        const error: string = testUtils.findElement('#errorMessage').nativeElement.innerHTML;
        const expectedError: string = `c'est caca monsieur.`;
        expect(error).toBe(expectedError);
        expect(router.navigate).not.toHaveBeenCalled();
    }));
    it('should show a message upon registration failure', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        // given some user
        fillInUserDetails();

        // when the user registers and it fails
        spyOn(authService, 'doRegister').and.resolveTo(MGPFallible.success(user));
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.failure(`c'est caca monsieur.` ));
        await testUtils.clickElement('#registerButton');
        testUtils.detectChanges();

        // then an error message is shown
        const error: string = testUtils.findElement('#errorMessage').nativeElement.innerHTML;
        const expectedError: string = `c'est caca monsieur.`;
        expect(error).toBe(expectedError);
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
});
