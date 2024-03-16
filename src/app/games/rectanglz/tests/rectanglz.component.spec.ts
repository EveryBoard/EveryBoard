import { fakeAsync } from '@angular/core/testing';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RectanglzComponent } from '../rectanglz.component';

describe('RectanglzComponent', () => {
    let testUtils: ComponentTestUtils<RectanglzComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<RectanglzComponent>('Rectanglz');
    }));

    it('should create', () => {
        // This test is done in all games to ensure that their initialization works as expected
        testUtils.expectToBeCreated();
    });

});
