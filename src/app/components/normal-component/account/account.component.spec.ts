/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { expectValidRouting, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { AccountComponent } from './account.component';

fdescribe('AccountComponent', () => {
    let testUtils: SimpleComponentTestUtils<AccountComponent>;


    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(AccountComponent);
        testUtils.detectChanges();
    }));

    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should redirect to reset password form when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();

        // Given some connected user
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        // When clicking on the "reset password" link
        testUtils.clickElement('#reset');
        // Then it should redirect to the reset password component
        expectValidRouting(router, ['/reset-password'], ResetPasswordComponent);
    }));
});
