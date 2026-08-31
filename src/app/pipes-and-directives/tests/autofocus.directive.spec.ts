/* eslint-disable max-lines-per-function */
import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZoneChangeDetection } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ConnectedUserService } from '../../services/ConnectedUserService';
import { ConnectedUserServiceMock } from '../../services/tests/ConnectedUserService.spec';
import { SimpleComponentTestUtils } from '../../utils/tests/TestUtils.spec';
import { AutofocusDirective } from '../autofocus.directive';

@Component({
    template: `<input type="text" autofocus />`,
    imports: [AutofocusDirective],
})
class AutofocusTestComponent {}

describe('AutofocusDirective', () => {
    let testUtils: SimpleComponentTestUtils<AutofocusTestComponent>;

    beforeEach(fakeAsync(async() => {
        await TestBed.configureTestingModule({
            imports: [AutofocusTestComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                provideZoneChangeDetection(),
                { provide: ConnectedUserService, useClass: ConnectedUserServiceMock },
            ],
        }).compileComponents();
        testUtils = await SimpleComponentTestUtils.create(AutofocusTestComponent, undefined, false);
    }));

    it('should autofocus components decorated with the directive', fakeAsync(() => {
        // Given an element with the autofocus directive
        const element: HTMLElement = testUtils.findElementByDirective(AutofocusDirective).nativeElement;
        spyOn(element, 'focus').and.callThrough();

        // When the component is loaded
        testUtils.detectChanges();
        tick(1);

        // Then the element is focused
        expect(element.focus).toHaveBeenCalledTimes(1);
    }));
});
