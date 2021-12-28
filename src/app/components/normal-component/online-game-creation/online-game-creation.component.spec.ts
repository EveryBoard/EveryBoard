/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { GameService } from 'src/app/services/GameService';
import { ActivatedRouteStub, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { OnlineGameCreationComponent } from './online-game-creation.component';

describe('OnlineGameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<OnlineGameCreationComponent>;

    const game: string = 'P4';

    it('should create and redirect to the chosen game', fakeAsync(async() => {
        // Given that the page is loaded for a specific game
        testUtils = await SimpleComponentTestUtils.create(OnlineGameCreationComponent, new ActivatedRouteStub(game));
        const gameService: GameService = TestBed.inject(GameService);
        spyOn(gameService, 'createGameAndRedirectOrShowError');
        // When the page is rendered
        testUtils.detectChanges();
        // Then it redirects to a new game
        expect(gameService.createGameAndRedirectOrShowError).toHaveBeenCalledOnceWith(game);
    }));
});
