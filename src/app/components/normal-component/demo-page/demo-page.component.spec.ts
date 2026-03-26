import { fakeAsync, tick } from '@angular/core/testing';

import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { DemoNodeInfo } from '../../wrapper-components/demo-card-wrapper/demo-card-wrapper.component';

import { DemoPageComponent } from './demo-page.component';

describe('DemoPageComponent', () => {

    let testUtils: SimpleComponentTestUtils<DemoPageComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(DemoPageComponent);
        testUtils.detectChanges();
        console.log('setTimeout patched:', setTimeout.toString());
    }));

    it('should create', fakeAsync(() => {
        expect(testUtils.getComponent()).toBeTruthy();
    }));

    it('should display demo nodes', () => {
        const numberOfDemos: number = testUtils.findElements('app-demo-card').length;
        expect(numberOfDemos)
            .withContext('app-demo-card should be present')
            .toBeGreaterThan(0);
    });

    it('should not have node whose parent is themself', () => {
        const demoNodeInfos: DemoNodeInfo[] = testUtils.getComponent().getDemoNodes();
        const nodeWithParentBeingThemselvesExist: boolean = demoNodeInfos.some((demoNode: DemoNodeInfo) => {
            return demoNode.node.parent.isPresent() &&
                   demoNode.node.gameState.turn === demoNode.node.parent.get().gameState.turn;
        });
        expect(nodeWithParentBeingThemselvesExist)
            .withContext('There should not be node whose parent is themself')
            .toBeFalse();
    });

    it('should adapt the number of columns upon change', fakeAsync(() => {
        // Given a demo page component
        // When changing the number of columns
        const newNumberOfColumns: number = 3;
        testUtils.getComponent().numberOfColumns.setValue(newNumberOfColumns);
        testUtils.detectChanges();
        tick(1);
        // Then the right number of columns should have been regenerated
        expect(testUtils.findElements('.column').length).toBe(newNumberOfColumns);
    }));

});
