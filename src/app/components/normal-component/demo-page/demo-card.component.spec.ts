import { DebugElement } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { P4Component } from 'src/app/games/p4/p4.component';
import { P4Node } from 'src/app/games/p4/P4Rules';
import { P4State } from 'src/app/games/p4/P4State';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DemoCardComponent } from './demo-card.component';

fdescribe('DemoCardComponent', () => {
    let testUtils: SimpleComponentTestUtils<DemoCardComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(DemoCardComponent);
        testUtils.getComponent().demoNodeInfo = {
            name: 'P4',
            component: P4Component,
            node: new P4Node(P4State.getInitialState()),
        };
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should display the game', () => {
        const game: DebugElement = testUtils.querySelector('app-p4');
        expect(game).withContext('game component should be displayed').toBeTruthy();
    });
});
