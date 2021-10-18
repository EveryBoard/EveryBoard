import { fakeAsync, TestBed } from '@angular/core/testing';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { VerifyAccountComponent } from './verify-account.component';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { MGPValidation } from 'src/app/utils/MGPValidation';

describe('VerifyAccountComponent', () => {
    let testUtils: SimpleComponentTestUtils<VerifyAccountComponent>;

    let authService: AuthenticationService;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(VerifyAccountComponent);
        authService = TestBed.inject(AuthenticationService);
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    describe('google user', () => {
        beforeEach(() => {
            // given a user that registered through google
            AuthenticationServiceMock.setUser(new AuthUser('jeanjaja@gmail.com', null, true));
            testUtils.detectChanges();
        });
        it('should ask the username if the user has none', fakeAsync(async() => {
            // when the user visits the page
            // then the username is asked
            testUtils.expectElementToExist('#askUsername');
        }));
        it('should let user know if setting the username succeeds', fakeAsync(async() => {
            const username: string = 'jeanjaja';
            testUtils.expectElementNotToExist('#success');

            // when a valid username is picked
            spyOn(authService, 'setUsername').and.resolveTo(MGPValidation.SUCCESS);
            testUtils.fillInput('#username', username);
            testUtils.detectChanges();
            testUtils.clickElement('#pickUsername');
            await testUtils.whenStable();

            // then the success message is shown
            testUtils.expectElementToExist('#success');
            testUtils.expectElementNotToExist('#askUsername');
            expect(authService.setUsername).toHaveBeenCalledWith(username);
        }));
        it('should show error if setting the username fails', fakeAsync(async() => {
            const failure: string = 'Invalid username';
            // when an invalid username is picked
            spyOn(authService, 'setUsername').and.resolveTo(MGPValidation.failure(failure));
            testUtils.fillInput('#username', 'jeanjiji');
            testUtils.detectChanges();
            testUtils.clickElement('#pickUsername');
            await testUtils.whenStable();

            // then the failure message is shown
            testUtils.expectElementNotToExist('#success');
            testUtils.expectElementToExist('#errorMessage');
            expect(testUtils.findElement('#errorMessage').nativeElement.innerHTML).toEqual(failure);
        }));
    });
    describe('email user', () => {
        beforeEach(() => {
            // given a user that registered through its email
            AuthenticationServiceMock.setUser(new AuthUser('jean@jaja.europe', 'jeanjaja', false));
            testUtils.detectChanges();
        });
        it('should resend email verification if asked by the user and show that it succeeded', fakeAsync(async() => {
            testUtils.expectElementNotToExist('#success');

            // when the user asks for sending the email
            spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);
            testUtils.expectElementToExist('#verificationEmail');
            testUtils.clickElement('#sendEmail');
            await testUtils.whenStable();

            // then the success message is shown
            testUtils.expectElementToExist('#success');
            expect(authService.sendEmailVerification).toHaveBeenCalledWith();
        }));
        it('should show error if sending the verification email failed', fakeAsync(async() => {
            const failure: string = 'I cannot send emails!';

            // when the user asks for sending the email
            spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.failure(failure));
            testUtils.clickElement('#sendEmail');
            await testUtils.whenStable();

            // then the success message is shown
            testUtils.expectElementNotToExist('#success');
            testUtils.expectElementToExist('#errorMessage');
            expect(testUtils.findElement('#errorMessage').nativeElement.innerHTML).toEqual(failure);
        }));
    });
});
