import { fakeAsync, TestBed } from '@angular/core/testing';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
    let testUtils: SimpleComponentTestUtils<ResetPasswordComponent>;

    let authService: AuthenticationService;

    const email: string = 'jean@jaja.europe';

    function fillInEmail() {
        testUtils.fillInput('#email', email);
        testUtils.detectChanges();
    }

    function getShownError(): string {
        testUtils.expectElementToExist('#errorMessage');
        return testUtils.findElement('#errorMessage').nativeElement.innerHTML;
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(ResetPasswordComponent);
        testUtils.detectChanges();
        authService = TestBed.inject(AuthenticationService);
    }));

    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should have button disabled if email is not filled in', fakeAsync(async() => {
        expect(testUtils.findElement('#resetPasswordButton').nativeElement.disabled).toBeTrue();
    }));
    it('should delegate to authentication service when button is clicked and show success message', fakeAsync(async() => {
        spyOn(authService, 'sendPasswordResetEmail').and.resolveTo(MGPValidation.SUCCESS);
        // given a user with an email
        fillInEmail();
        // when asking for password reset
        await testUtils.clickElement('#resetPasswordButton');
        // then it has called sendPasswordResetEmail and shows the success message
        expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(email);
        expect(testUtils.findElement('#successMessage').nativeElement.innerHTML).toEqual('The email has been sent, please follow the instructions from that email.');
    }));
    it('should show error message upon failure', fakeAsync(async() => {
        // given a user with an email that will fail password reset
        spyOn(authService, 'sendPasswordResetEmail').and.resolveTo(MGPValidation.failure('error'));
        fillInEmail();
        // when asking for password reset
        await testUtils.clickElement('#resetPasswordButton');
        // then it has called sendPasswordResetEmail and shows the success message
        expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(email);
        expect(getShownError()).toEqual('error');
    }));
});
