/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { AuthenticationService, AuthUser } from 'src/app/services/AuthenticationService';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { VerifyAccountComponent } from './verify-account.component';
import { AuthenticationServiceMock } from 'src/app/services/tests/AuthenticationService.spec';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Router } from '@angular/router';
import { MGPOptional } from 'src/app/utils/MGPOptional';

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
            AuthenticationServiceMock.setUser(new AuthUser(MGPOptional.of('jeanjaja@gmail.com'), MGPOptional.empty(), true));
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
            await testUtils.clickElement('#pickUsername');
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
            await testUtils.clickElement('#pickUsername');
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
            AuthenticationServiceMock.setUser(new AuthUser(MGPOptional.of('jean@jaja.europe'), MGPOptional.of('jeanjaja'), false));
            testUtils.detectChanges();
        });
        it('should resend email verification if asked by the user and show that it succeeded', fakeAsync(async() => {
            testUtils.expectElementNotToExist('#success');

            // when the user asks for sending the email
            spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);
            testUtils.expectElementToExist('#verificationEmail');
            await testUtils.clickElement('#sendEmail');

            // then the success message is shown
            testUtils.expectElementToExist('#success');
            expect(authService.sendEmailVerification).toHaveBeenCalledWith();
        }));
        it('should show error if sending the verification email failed', fakeAsync(async() => {
            const failure: string = 'I cannot send emails!';

            // when the user asks for sending the email
            spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.failure(failure));
            await testUtils.clickElement('#sendEmail');

            // then the success message is shown
            testUtils.expectElementNotToExist('#success');
            testUtils.expectElementToExist('#errorMessage');
            expect(testUtils.findElement('#errorMessage').nativeElement.innerHTML).toEqual(failure);
        }));
        it('should not finalize verification if the user did not verify its email', fakeAsync(async() => {
            // when the user clicks on "finalize" without having verified its account
            await testUtils.clickElement('#finalizeVerification');

            // then a failure message is shown
            testUtils.expectElementNotToExist('#success');
            testUtils.expectElementToExist('#errorMessage');
            expect(testUtils.findElement('#errorMessage').nativeElement.innerHTML).toEqual(`You have not verified your email! Click on the link in the verification email.`);
        }));
        it('should finalize verification after the user has verified its email and clicked on the button', fakeAsync(async() => {
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate').and.resolveTo(true);

            // ... and given a user that verified its email
            AuthenticationServiceMock.setUser(new AuthUser(MGPOptional.of('jean@jaja.europe'), MGPOptional.of('jeanjaja'), true));

            // when the user clicks on "finalize" without having verified its account
            await testUtils.clickElement('#finalizeVerification');

            // then a failure message is shown
            testUtils.expectElementNotToExist('#errorMessage');
            expect(router.navigate).toHaveBeenCalledWith(['/server']);
        }));

    });
});
