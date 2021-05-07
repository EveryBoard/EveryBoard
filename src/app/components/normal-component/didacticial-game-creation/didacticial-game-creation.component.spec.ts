import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

import { DidacticialGameCreationComponent } from './didacticial-game-creation.component';

describe('DidacticialGameCreationComponent', () => {
    let testUtils: SimpleComponentTestUtils<DidacticialGameCreationComponent>;

    beforeEach(async() => {
        testUtils = await SimpleComponentTestUtils.create(DidacticialGameCreationComponent);
        testUtils.detectChanges();
    });
    it('should create and redirect to chosen game', fakeAsync(async() => {
        testUtils.getComponent().pickGame('whateverGame');
        spyOn(testUtils.getComponent().router, 'navigate');
        expect(await testUtils.clickElement('#launchDidacticial')).toBeTrue();
        expect(testUtils.getComponent().router.navigate).toHaveBeenCalledOnceWith(['didacticial/whateverGame']);
    }));
});
