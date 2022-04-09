/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
    let testUtils: SimpleComponentTestUtils<NotFoundComponent>;

    const MESSAGE: string = 'Displayed message';

    beforeEach(async() => {
        const routeStub: ActivatedRouteStub = new ActivatedRouteStub();
        routeStub.setRoute('message', MESSAGE);
        testUtils = await SimpleComponentTestUtils.create(NotFoundComponent, routeStub);
    });
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should display the message provided as argument', () => {
        testUtils.detectChanges();
        const messageElement: DebugElement = testUtils.findElement('.message-body');
        expect(messageElement.nativeElement.innerText).toEqual(MESSAGE);
    });
});
