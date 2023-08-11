/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { LodestoneNode } from 'src/app/games/lodestone/LodestoneRules';
import { LodestoneState } from 'src/app/games/lodestone/LodestoneState';
import { P4Node } from 'src/app/games/p4/P4Rules';
import { P4State } from 'src/app/games/p4/P4State';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { AbstractRules } from 'src/app/jscaip/Rules';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { DemoCardWrapperComponent, DemoNodeInfo } from './demo-card-wrapper.component';

describe('DemoCardComponent', () => {
    let testUtils: SimpleComponentTestUtils<DemoCardWrapperComponent>;

    function loadNode(nodeInfo: DemoNodeInfo): void {
        testUtils.getComponent().demoNodeInfo = nodeInfo;
        testUtils.detectChanges();
        tick(1); // Need at least 1ms because of the setTimeout in ngAfterViewInit
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(DemoCardWrapperComponent);
    }));
    it('should display the game from the point of view the current player', fakeAsync(async() => {
        // Given a demo component
        const board: Table<PlayerOrNone> = P4State.getInitialState().board; // dummy board

        // When displaying it for a given game
        loadNode({
            name: 'P4',
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
            node: new P4Node(P4State.getInitialState()),
            click: MGPOptional.empty(),
        });
        const rules: AbstractRules = testUtils.getComponent().gameComponent.rules;
        spyOn(rules, 'choose').and.callThrough();

        // When trying to perform a move
        await testUtils.clickElement('#click_2');

        // Then it should not call rules.choose
        expect(testUtils.getComponent().gameComponent.rules.choose).not.toHaveBeenCalled();
    }));
    it('should do nothing when you pass', fakeAsync(async() => {
        // Given any starting state of component
        // When passing
        const result: void = await testUtils.getComponent().onCancelMove('not even necessary');
        // Then nothing should have happend (for coverage sake)
        expect(result).withContext('should be null').toBe();
    }));
});
