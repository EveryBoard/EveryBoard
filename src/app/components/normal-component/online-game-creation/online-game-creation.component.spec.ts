import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameCreationComponent } from './online-game-creation.component';

describe('OnlineGameCreationComponent', () => {
    let testUtils: SimpleComponentTestUtils<OnlineGameCreationComponent>;
    let router: Router;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameCreationComponent);
        testUtils.detectChanges();
        router = TestBed.inject(Router);
    }));
    it('should create and redirect to chosen game', fakeAsync(async() => {
        testUtils.getComponent().pickGame('whateverGame');
        spyOn(router, 'navigate');
        expect(await testUtils.clickElement('#playOnline')).toBeTrue();
        tick();
        expect(router.navigate)
            .toHaveBeenCalledOnceWith(['/play/whateverGame', 'PartDAOMock0']);
    }));
});
