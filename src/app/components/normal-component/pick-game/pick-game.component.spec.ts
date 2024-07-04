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

    it('should filter results based on typed characters', fakeAsync(async() => {
        // Given a pick-game page with games
        testUtils.detectChanges();
        const gamesBeforeFiltering: number = testUtils.findElements('.card').length;

        // When entering a letter, e.g., an A
        testUtils.fillInput('#search-term', 'A');
        testUtils.detectChanges();

        // Then it should have filtered the games, and still contain e.g., Awale
        const gamesAfterFiltering: number = testUtils.findElements('.card').length;
        expect(gamesAfterFiltering).toBeLessThan(gamesBeforeFiltering);
        testUtils.expectElementToExist('#image-Awale');
        // but not e.g., Coerceo
        testUtils.expectElementNotToExist('#image-Coerceo');
    }));

    it('should be insensitive to case', fakeAsync(async() => {
        // Given a pick-game page with games including Awale
        testUtils.expectElementToExist('#image-Awale');
        testUtils.detectChanges();

        // When entering a search mixing uppercase and lowercase
        testUtils.fillInput('#search-term', 'aWalE');
        testUtils.detectChanges();

        // Then it should not filter based on case
        testUtils.expectElementToExist('#image-Awale');
    }));

    it('should be insensitive to spaces', fakeAsync(async() => {
        // Given a pick-game page with games including Awale
        testUtils.expectElementToExist('#image-Awale');
        testUtils.detectChanges();

        // When entering a search with extra spaces
        testUtils.fillInput('#search-term', 'A wa le');
        testUtils.detectChanges();

        // Then it should not filter based on spaces
        testUtils.expectElementToExist('#image-Awale');
    }));
    it('should be insensitive to diacritics', fakeAsync(async() => {
        // Given a pick-game page with games including Awale
        testUtils.expectElementToExist('#image-Awale');
        testUtils.detectChanges();

        // When entering a search with diacritics
        testUtils.fillInput('#search-term', 'Àẃàlé');
        testUtils.detectChanges();

        // Then it should not filter based on spaces
        testUtils.expectElementToExist('#image-Awale');
    }));

});
