import { fakeAsync, tick } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameCreationComponent } from './online-game-creation.component';

describe('OnlineGameCreationComponent', () => {
    let testUtils: SimpleComponentTestUtils<OnlineGameCreationComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameCreationComponent);
        testUtils.detectChanges();
    }));
    it('should create and redirect to chosen game', fakeAsync(async() => {
        testUtils.getComponent().pickGame('whateverGame');
        spyOn(testUtils.getComponent().router, 'navigate');
        expect(await testUtils.clickElement('#playOnline')).toBeTrue();
        tick();
        expect(testUtils.getComponent().router.navigate)
            .toHaveBeenCalledOnceWith(['/play/whateverGame', 'PartDAOMock0']);
    }));
});
