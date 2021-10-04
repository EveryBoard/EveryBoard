import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { InscriptionComponent } from './inscription.component';

describe('InscriptionComponent', () => {
    let testUtils: SimpleComponentTestUtils<InscriptionComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(InscriptionComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('Registration should send email verification and navigate back to homepage', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        const authService: AuthenticationService = TestBed.inject(AuthenticationService);
        spyOn(router, 'navigate');
        spyOn(authService, 'sendEmailVerification').and.resolveTo(MGPValidation.SUCCESS);

        // given some user
        testUtils.findElement('#email').nativeElement.value = 'jean@jaja.europe';
        testUtils.findElement('#username').nativeElement.value = 'jeanjaja';
        testUtils.findElement('#password').nativeElement.value = 'hunter2';

        // when the user registers
        await testUtils.clickElement('#registerButton');

        expect(testUtils.getComponent().router.navigate).toHaveBeenCalledWith(['/']);
        expect(authService.sendEmailVerification).toHaveBeenCalled();
    }));
    it('Registration failure should show a message', fakeAsync(async() => {
        spyOn(testUtils.getComponent().router, 'navigate');
        spyOn(testUtils.getComponent().authService, 'doRegister').and.rejectWith({ message: `c'est caca monsieur.` });

        await testUtils.clickElement('#registerButton');

        const expectedError: string = testUtils.findElement('#errorMessage').nativeElement.innerHTML;
        expect(testUtils.getComponent().router.navigate).not.toHaveBeenCalled();
        expect(expectedError).toBe(`c'est caca monsieur.`);
    }));
});
