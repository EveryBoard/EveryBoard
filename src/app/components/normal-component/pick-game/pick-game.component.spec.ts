/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { PickGameComponent } from './pick-game.component';

describe('PickGameComponent', () => {

    let testUtils: SimpleComponentTestUtils<PickGameComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PickGameComponent);
    }));

    it('should create', fakeAsync(async() => {
        expect(testUtils.getComponent()).toBeTruthy();
    }));

    it('should emit an event when a game has been selected', fakeAsync(async() => {
        spyOn(testUtils.getComponent().pickGame, 'emit').and.returnValue();

        await testUtils.clickElement('#image-P4');

        expect(testUtils.getComponent().pickGame.emit)
            .toHaveBeenCalledWith('P4');
    }));

});
