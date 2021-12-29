/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

import { PickGameComponent } from './pick-game.component';

describe('PickGameComponent', () => {

    let testUtils: SimpleComponentTestUtils<PickGameComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(PickGameComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should emit an event when a game has been selected', fakeAsync(async() => {
        spyOn(testUtils.getComponent().pickGame, 'emit');

        const gameSelection: HTMLSelectElement = testUtils.findElement('#gameType').nativeElement;
        gameSelection.value = gameSelection.options[2].value;
        gameSelection.dispatchEvent(new Event('change'));
        testUtils.detectChanges();

        expect(testUtils.getComponent().pickGame.emit).toHaveBeenCalledWith(gameSelection.options[2].innerText);
    }));
});
