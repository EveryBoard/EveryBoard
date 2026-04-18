/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';

import { UserMocks } from '../../../domain/UserMocks.spec';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { expectValidRoutingLink, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';

import { AccountComponent } from './account.component';

describe('AccountComponent', () => {

    let testUtils: SimpleComponentTestUtils<AccountComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(AccountComponent);
        testUtils.detectChanges();
    }));

    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should redirect to reset password form when clicking on the corresponding button', fakeAsync(async() => {
        // Given some connected user
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        // When displaying the page
        // Then it should show a reset link pointing to the reset password component
        const button: DebugElement = testUtils.findElement('#reset');
        await expectValidRoutingLink(button, '/reset-password', ResetPasswordComponent);
    }));
});
