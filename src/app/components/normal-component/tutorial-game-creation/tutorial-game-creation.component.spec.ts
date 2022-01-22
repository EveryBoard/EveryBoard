/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

import { TutorialGameCreationComponent } from './tutorial-game-creation.component';

describe('TutorialGameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<TutorialGameCreationComponent>;

    beforeEach(async() => {
        testUtils = await SimpleComponentTestUtils.create(TutorialGameCreationComponent);
        testUtils.detectChanges();
    });
    it('should create and redirect to chosen game', fakeAsync(async() => {
        testUtils.getComponent().pickGame('whateverGame');
        spyOn(testUtils.getComponent().router, 'navigate');
        await testUtils.clickElement('#launchTutorial');
        expect(testUtils.getComponent().router.navigate).toHaveBeenCalledOnceWith(['/tutorial/', 'whateverGame']);
    }));
});
