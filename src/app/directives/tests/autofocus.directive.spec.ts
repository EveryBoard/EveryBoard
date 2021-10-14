import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AutofocusDirective } from '../autofocus.directive';

@Component({
    template: `<input type="text" autofocus />`,
})
class AutofocusTestComponent { }

describe('AutofocusDirective', () => {
    let testUtils: SimpleComponentTestUtils<AutofocusTestComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(AutofocusTestComponent);
    }));

    it('should autofocus components decorated with the directive', () => {
        // given an element with the autofocus directive
        const element: HTMLElement = testUtils.findElementByDirective(AutofocusDirective).nativeElement;
        spyOn(element, 'focus');

        // when the component is loaded
        testUtils.detectChanges();

        // then the element is focused
        expect(element.focus).toHaveBeenCalledTimes(1);
    });
});
