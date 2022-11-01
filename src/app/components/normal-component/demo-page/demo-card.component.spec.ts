import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { LodestoneComponent } from 'src/app/games/lodestone/lodestone.component';
import { LodestoneNode } from 'src/app/games/lodestone/LodestoneRules';
import { LodestoneState } from 'src/app/games/lodestone/LodestoneState';
import { P4Component } from 'src/app/games/p4/p4.component';
import { P4Node } from 'src/app/games/p4/P4Rules';
import { P4State } from 'src/app/games/p4/P4State';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { AbstractRules } from 'src/app/jscaip/Rules';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DemoCardComponent, DemoNodeInfo } from './demo-card.component';

describe('DemoCardComponent', () => {
    let testUtils: SimpleComponentTestUtils<DemoCardComponent>;

    function loadNode(nodeInfo: DemoNodeInfo): void {
        testUtils.getComponent().demoNodeInfo = nodeInfo;
        testUtils.detectChanges();
        tick(1); // because of the setTimeout in ngAfterViewInit
    }

    beforeEach(fakeAsync(async() => {
         testUtils = await SimpleComponentTestUtils.create(DemoCardComponent);
    }))
    it('should display the game from the point of view the current player', fakeAsync(async() => {
        // Given a demo component
        // When displaying it for a given game
        const board: Table<PlayerOrNone> = P4State.getInitialState().board; // dummy board
        loadNode({
            name: 'P4',
            component: P4Component,
            // Current player is player 1
            node: new P4Node(new P4State(board, 1)),
            click: MGPOptional.empty(),
        });

        // Then it should display the game
        const game: DebugElement = testUtils.findElement('app-p4');
        expect(game).withContext('game component should be displayed').toBeTruthy();
        // from the point of view of the current player
        expect(testUtils.getComponent().gameComponent?.role).toBe(Player.ONE);
        expect(testUtils.getComponent().gameComponent?.isPlayerTurn()).toBeTrue();
    }));
    it('should simulate clicks', fakeAsync(async() => {
        // Given a demo component
        // When displaying it for a game that has intermediary clicks
        loadNode({
            name: 'Lodestone',
            component: LodestoneComponent,
            node: new LodestoneNode(LodestoneState.getInitialState()),
            click: MGPOptional.of('#lodestone_push_orthogonal'),
        });

        // Then it should have performed a click
        testUtils.expectElementToHaveClass('#lodestone_push_orthogonal > .outside', 'selected-stroke');
    }));
    it('should not allow moves', fakeAsync(async() => {
        // Given a demo component displayed for a game
        loadNode({
            name: 'P4',
            component: P4Component,
            node: new P4Node(P4State.getInitialState()),
            click: MGPOptional.empty(),
        });
        const rules: AbstractRules = testUtils.getComponent().gameComponent.rules;
        spyOn(rules, 'choose');

        // When trying to perform a move
        testUtils.clickElement('#click_2');

        // Then it should not call rules.choose
        expect(testUtils.getComponent().gameComponent.rules.choose).not.toHaveBeenCalled();
    }))
});