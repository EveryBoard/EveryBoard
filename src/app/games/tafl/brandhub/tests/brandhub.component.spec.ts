import { BrandhubComponent } from '../brandhub.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { BrandhubRules } from '../BrandhubRules';

describe('BrandhubComponent', () => {

    let componentTestUtils: ComponentTestUtils<BrandhubComponent>;

    beforeEach(fakeAsync(async() => {
        MGPNode.ruler = BrandhubRules.get();
        componentTestUtils = await ComponentTestUtils.forGame<BrandhubComponent>('Brandhub');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeDefined();
    });
});
