import { Component } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

@Component({
    template: `<input id="password" type="password"/>
<span class="icon is-small is-right">
<p id="toggle" class="clickable-icon" toggleVisibility>show</p>
</span>
`,
})
class ToggleVisibilityTestComponent { }

describe('ToggleVisibilityDirective', () => {
    let testUtils: SimpleComponentTestUtils<ToggleVisibilityTestComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(ToggleVisibilityTestComponent);
    }));

    fit('should change the type to text when clicked, and back to password when clicked a second time', () => {
        // given an element with the toggleVisibility directive
        expect(testUtils.findElement('#password').nativeElement.getAttribute('type')).toBe('password');

        // when the component is clicked a first time
        testUtils.clickElement('#toggle');
        testUtils.detectChanges();

        // then the input is now of type text
        expect(testUtils.findElement('#password').nativeElement.getAttribute('type')).toBe('text');

        // when the component is clicked a second time
        testUtils.clickElement('#toggle');
        testUtils.detectChanges();

        // then the input is again a password
        expect(testUtils.findElement('#password').nativeElement.getAttribute('type')).toBe('password');
    });
});
