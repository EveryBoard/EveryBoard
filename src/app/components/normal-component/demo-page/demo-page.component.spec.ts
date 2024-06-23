import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {

    let testUtils: SimpleComponentTestUtils<DemoPageComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(DemoPageComponent);
        testUtils.detectChanges();
    }));

    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });

    it('should display demo nodes', () => {
        expect(testUtils.findElements('app-demo-card').length).withContext('app-demo-card should be present').toBeGreaterThan(0);
    });

    it('should adapt the number of columns upon change', () => {
        // Given a demo page component
        // When changing the number of columns
        const newNumberOfColumns: number = 3;
        testUtils.getComponent().numberOfColumns.setValue(newNumberOfColumns);
        testUtils.detectChanges();
        // Then the right number of columns should have been regenerated
        expect(testUtils.findElements('.column').length).toBe(newNumberOfColumns);
    });

});
