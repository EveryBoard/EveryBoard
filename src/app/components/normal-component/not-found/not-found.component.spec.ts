/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
    const MESSAGE: string = 'Displayed message';

    let testUtils: SimpleComponentTestUtils<NotFoundComponent>;
    let routeStub: ActivatedRouteStub;

    beforeEach(() => {
        routeStub = new ActivatedRouteStub();
    });

    it('should create', fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(NotFoundComponent, routeStub);

        expect(testUtils.getComponent()).toBeTruthy();
    }));
    it('should display the message provided as argument', fakeAsync(async() => {
        routeStub.setRoute('message', MESSAGE);
        testUtils = await SimpleComponentTestUtils.create(NotFoundComponent, routeStub);

        testUtils.detectChanges();
        const messageElement: DebugElement = testUtils.findElement('.message-body');
        expect(messageElement.nativeElement.innerText).toEqual(MESSAGE);
    }));
    it('should have a default message in case none are given', fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(NotFoundComponent, routeStub);
        testUtils.detectChanges();
        const messageElement: DebugElement = testUtils.findElement('.message-body');
        expect(messageElement.nativeElement.innerText).toEqual(`This page does not exist.`);
    }));
});
