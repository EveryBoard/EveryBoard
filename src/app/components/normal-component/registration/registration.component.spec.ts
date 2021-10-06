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

    const username: string = 'jeanjaja';
    const email: string = 'jean@jaja.europe';
    const password: string = 'hunter2';

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(RegistrationComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('Registration should register, send email verification, and navigate back to homepage', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        const authService: AuthenticationService = TestBed.inject(AuthenticationService);
        spyOn(router, 'navigate');
        spyOn(authService, 'doRegister').and.resolveTo(MGPFallible.success({ displayName: 'jeanjaja', email: 'jean@jaja.europe' } as firebase.User));
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);

        // given some user
        testUtils.fillInput('#email', email);
        testUtils.fillInput('#username', username);
        testUtils.fillInput('#password', password);

        // when the user registers
        await testUtils.clickElement('#registerButton');

        // then the user is registered
        expect(router.navigate).toHaveBeenCalledWith(['/']);
        expect(authService.sendEmailVerification).toHaveBeenCalledWith();
        expect(authService.doRegister).toHaveBeenCalledWith(username, email, password);
    }));
    it('Registration failure should show a message', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        spyOn(testUtils.getComponent().authService, 'doRegister').and.resolveTo(MGPFallible.failure(`c'est caca monsieur.` ));

        await testUtils.clickElement('#registerButton');

        const expectedError: string = testUtils.findElement('#errorMessage').nativeElement.innerHTML;
        expect(router.navigate).not.toHaveBeenCalled();
        expect(expectedError).toBe(`c'est caca monsieur.`);
    }));
});
