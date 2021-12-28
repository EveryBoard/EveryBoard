/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameSelectionComponent } from './online-game-selection.component';

describe('OnlineGameSelectionComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameSelectionComponent>;
    let router: Router;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameSelectionComponent);
        testUtils.detectChanges();
        router = TestBed.inject(Router);
    }));
    it('should create and redirect to chosen game', fakeAsync(async() => {
        testUtils.getComponent().pickGame('whateverGame');
        spyOn(router, 'navigate');
        await testUtils.clickElement('#playOnline');
        tick();
        expect(router.navigate)
            .toHaveBeenCalledOnceWith(['/play/whateverGame', 'PartDAOMock0']);
    }));
});
