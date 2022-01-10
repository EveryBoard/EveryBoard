/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameService } from 'src/app/services/GameService';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameSelectionComponent } from './online-game-selection.component';

describe('OnlineGameSelectionComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameSelectionComponent>;
    let gameService: GameService;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(OnlineGameSelectionComponent);
        testUtils.detectChanges();
        gameService = TestBed.inject(GameService);
    }));
    it('should rely on GameService to create chosen game', fakeAsync(async() => {
        // Given a chosen game
        testUtils.getComponent().pickGame('whateverGame');
        spyOn(gameService, 'createGameAndRedirectOrShowError').and.resolveTo(true);

        // When clicking on 'play'
        await testUtils.clickElement('#playOnline');
        tick();

        // Then the user is redirected to the game
        expect(gameService.createGameAndRedirectOrShowError).toHaveBeenCalledWith('whateverGame');
    }));
});
