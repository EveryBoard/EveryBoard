import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { P4Component } from 'src/app/games/p4/p4.component';
import { P4Node } from 'src/app/games/p4/P4Rules';
import { P4State } from 'src/app/games/p4/P4State';
import { Player } from 'src/app/jscaip/Player';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DemoCardComponent } from './demo-card.component';


describe('DemoCardComponent', () => {
    it('should display the game from the point of view the current player', fakeAsync(async() => {
        // Given a demo card component
        const testUtils: SimpleComponentTestUtils<DemoCardComponent> =
            await SimpleComponentTestUtils.create(DemoCardComponent);

        // When displaying it for a given game
        testUtils.getComponent().demoNodeInfo = {
            name: 'P4',
            component: P4Component,
            node: new P4Node(P4State.getInitialState()),
        };
        testUtils.detectChanges();

        // Then it should display the game
        const game: DebugElement = testUtils.findElement('app-p4');
        expect(game).withContext('game component should be displayed').toBeTruthy();
        // from the point of view of the current player
        expect(testUtils.getComponent().gameComponent?.role).toBe(Player.ZERO);
        expect(testUtils.getComponent().gameComponent?.isPlayerTurn()).toBeTrue();
    }));
});
