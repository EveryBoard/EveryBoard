import { fakeAsync, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthenticationService } from 'src/app/services/AuthenticationService';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Router } from '@angular/router';
import { MGPValidation } from 'src/app/utils/MGPValidation';

fdescribe('LoginComponent', () => {
    let testUtils: SimpleComponentTestUtils<LoginComponent>;

    let router: Router;

    let authenticationService: AuthenticationService;

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
        it('should redirect when email login succeeds', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given a user
            const email: string = 'jean@jaja.europe';
            const password: string = 'hunter2';

            // when the user logs in
            spyOn(authenticationService, 'doEmailLogin').and.resolveTo(MGPValidation.SUCCESS);
            testUtils.fillInput('#email', email);
            testUtils.fillInput('#password', password);
            await testUtils.clickElement('#loginButton');
            await testUtils.whenStable();
            testUtils.detectChanges();

            // then email login has been performed and the user is redirected
            expect(authenticationService.doEmailLogin).toHaveBeenCalledWith(email, password);
            expect(router.navigate).toHaveBeenCalledWith(['/server']);
        }));
    });
    describe('doGoogleLogin', () => {
        it('should redirect when email connection work', fakeAsync(async() => {
            spyOn(router, 'navigate').and.callFake(async() => true);

            // given a google user

            // when the user logs in
            spyOn(authenticationService, 'doGoogleLogin').and.resolveTo(MGPValidation.SUCCESS);
            await testUtils.clickElement('#googleButton');

            // then google login has been performed and the user is redirected
            expect(authenticationService.doGoogleLogin).toHaveBeenCalledWith()
            expect(router.navigate).toHaveBeenCalledWith(['/server']);
        }));
    });
});
